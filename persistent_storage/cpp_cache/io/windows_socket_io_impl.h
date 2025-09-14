#ifndef RUNNER_INCLUDED
#define RUNNER_INCLUDED
#include "../use_cases/runner.h"
#endif

#ifndef IO_AS_RUNNER_INCLUDED
#define IO_AS_RUNNER_INCLUDED
#include "classes/io_as_runner.h"
#endif

#ifndef CUSTOM_COUT_INCLUDED
#define CUSTOM_COUT_INCLUDED
#include "custom_cout.h"
#endif

#ifndef CONSTANTS
#define CONSTANTS
#include "constants.h"
#endif

#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
#include <memory>
#include <chrono>

class WindowsSocketIoImpl : public IOAsRunner
{
    CustomCout *&printer;
    CommandLineArguments &args;
    Runner *&runner;

private:
    // Reference: https://learn.microsoft.com/en-us/windows/win32/WinSock/creating-a-socket-for-the-server
    bool initialize()
    {
        WSADATA wsaData;
        int startup_result = WSAStartup(MAKEWORD(2, 2), &wsaData);
        if (startup_result != 0)
        {
            *printer << "Failed to initialize winsock";
            return false;
        }
        return true;
    }

    // Reference: https://learn.microsoft.com/en-us/windows/win32/WinSock/creating-a-socket-for-the-server
    void config_addrinfo(sockaddr_in &address_info)
    {
        ZeroMemory(&address_info, sizeof(struct sockaddr_in));

        address_info.sin_family = AF_INET;
        address_info.sin_addr.s_addr = inet_addr("127.0.0.1");
        address_info.sin_port = htons((u_short)args.Port.value);
    }

    // Reference: https://learn.microsoft.com/en-us/windows/win32/WinSock/creating-a-socket-for-the-server
    bool initialize_socket(SOCKET &sock)
    {
        sock = INVALID_SOCKET;
        sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (sock == INVALID_SOCKET)
        {
            *printer << "Error while creating socket: " << std::to_string(WSAGetLastError());
            WSACleanup();
            return false;
        }
        return true;
    }

    // Reference: https://learn.microsoft.com/en-us/windows/win32/WinSock/binding-a-socket
    bool bind_socket(sockaddr_in &server_address_info, SOCKET &server_sock)
    {
        int bind_call_result = bind(server_sock, (struct sockaddr *)&server_address_info, sizeof(struct sockaddr));
        if (bind_call_result == SOCKET_ERROR)
        {
            *printer << "Error while binding: " << std::to_string(WSAGetLastError());
            closesocket(server_sock);
            WSACleanup();
            return false;
        }
        return true;
    }

    // Reference: https://learn.microsoft.com/en-us/windows/win32/WinSock/listening-on-a-socket
    bool begin_listening(SOCKET &server_sock)
    {
        if (listen(server_sock, args.BacklogSize.value) == SOCKET_ERROR)
        {
            *printer << "Error on start listening: " << std::to_string(WSAGetLastError());
            closesocket(server_sock);
            WSACleanup();
            return false;
        }
        return true;
    }

    void print_server_sock_port(SOCKET &server_sock)
    {
        sockaddr_in socket_addr_info;
        int size_of_socket_addr_info = sizeof(socket_addr_info);
        getsockname(server_sock, (sockaddr *)&socket_addr_info, &size_of_socket_addr_info);
        std::string constructed_output{"Bound socket listening on port "};
        constructed_output.append(std::to_string(ntohs(socket_addr_info.sin_port))).append("...");
        *printer << constructed_output;
    }

    bool configure(SOCKET &server_sock)
    {
        sockaddr_in address_info{};
        config_addrinfo(address_info);

        if (args.verbose())
        {
            *printer << "\tInitializing winsock...";
        }
        if (!initialize())
            return false;

        if (args.verbose())
        {
            *printer << "\tInitializing socket...";
        }

        if (!initialize_socket(server_sock))
            return false;

        if (args.verbose())
        {
            *printer << "\tBinding socket...";
        }

        if (!bind_socket(address_info, server_sock))
            return false;

        if (!begin_listening(server_sock))
            return false;
        return true;
    }

    // Reference: https://learn.microsoft.com/en-us/windows/win32/WinSock/accepting-a-connection
    bool accept_connection(SOCKET &server_sock, SOCKET &client_sock)
    {
        client_sock = INVALID_SOCKET;
        client_sock = accept(server_sock, NULL, NULL);
        if (client_sock == INVALID_SOCKET)
        {
            *printer << "Error while accepting connection: " << std::to_string(WSAGetLastError());
            closesocket(server_sock);
            WSACleanup();
            return false;
        }
        return true;
    }

    bool send_and_receive_until_close(SOCKET &client_sock)
    {
        // For receiving raw data
        auto receiving_buffer = std::make_unique<char[]>(args.MaximumInputSizeBytes.value);
        int receiving_buffer_length = args.MaximumInputSizeBytes.value, received_bytes_len = 1;

        // Response code from send call
        int send_response;

        // For request; command is just used internally by processor
        std::string a, b, c;
        Command command_for_parser{a, b, c};
        std::string response_to_request;

        // For performance statements
        std::chrono::time_point<std::chrono::system_clock> start;
        size_t number_of_requests_processed = 0;
        // if (args.verbose())
        // {
        start = std::chrono::system_clock::now();
        // }

        while (received_bytes_len != 0)
        {
            memset(receiving_buffer.get(), 0, receiving_buffer_length);
            received_bytes_len = recv(client_sock, receiving_buffer.get(), receiving_buffer_length, 0);
            if (received_bytes_len > 0)
            {
                ++number_of_requests_processed;

                if (args.verbose())
                {
                    *printer << "\tReceived message from client: " + std::string{receiving_buffer.get()};
                }

                // Process command
                std::string buffer_as_string{receiving_buffer.get()};
                runner->process_command(buffer_as_string, command_for_parser, response_to_request);

                if (response_to_request == std::string(""))
                {
                    if (!shut_client(client_sock))
                    {
                        return false;
                    }
                };

                if (args.verbose())
                {
                    if (response_to_request.at(response_to_request.size() - 1) == '\n')
                    {
                        response_to_request.pop_back();
                    }
                    *printer << "\tSent response to client: " + response_to_request;
                }

                // Send response
                send_response = send(client_sock, response_to_request.c_str(), received_bytes_len, 0);
                if (send_response == SOCKET_ERROR)
                {
                    *printer << "Error while sending to client: ", std::to_string(WSAGetLastError());
                    closesocket(client_sock);
                    WSACleanup();
                    return false;
                }
            }
            else if (received_bytes_len == 0)
            {
                *printer << "\tClient stopped sending...";
                // if (args.verbose())
                // {
                std::chrono::time_point<std::chrono::system_clock> end =
                    std::chrono::system_clock::now();
                auto duration_in_ms = std::chrono::duration<double>(end - start);
                std::string performance_statement{"\tProcessed "};
                performance_statement.append(std::to_string(number_of_requests_processed)).append(" requests in ").append(std::to_string(duration_in_ms.count())).append(" seconds");
                *printer << performance_statement;
                // }
                shut_client(client_sock);
                return true;
            }
        }
        return true;
    }

    bool shut_client(SOCKET &client_sock)
    {
        int shutdown_result = shutdown(client_sock, SD_SEND);
        closesocket(client_sock);
        if (shutdown_result == SOCKET_ERROR)
        {
            *printer << "Error while shutting down client: " << std::to_string(WSAGetLastError());
            closesocket(client_sock);
            WSACleanup();
            return false;
        }
        return true;
    }

public:
    WindowsSocketIoImpl(CustomCout *&printer, CommandLineArguments &args, Runner *&runner) : printer{printer}, args{args}, runner{runner} {};
    ~WindowsSocketIoImpl() { delete printer; };
    WindowsSocketIoImpl(const WindowsSocketIoImpl &w) : printer{w.printer}, args{w.args}, runner{w.runner} {}
    WindowsSocketIoImpl &operator=(const WindowsSocketIoImpl &w)
    {
        delete this->printer;
        this->printer = w.printer;
        this->args = w.args;
        this->runner = w.runner;
        return *this;
    }

    void run(int argument_count, const char **arguments)
    {
        runner->parse_command_line_args(argument_count, arguments, args);

        if (args.verbose())
        {
            *printer << "Creating client and server sockets...";
        }
        SOCKET server_sock = INVALID_SOCKET, client_sock = INVALID_SOCKET;

        if (args.verbose())
        {
            *printer << "Configuring sockets...";
        }
        if (!configure(server_sock))
        {
            return;
        };

        print_server_sock_port(server_sock);

        while (true)
        {
            if (args.verbose())
            {
                *printer << "Waiting for connection...";
            }
            if (!accept_connection(server_sock, client_sock))
                break;
            if (args.verbose())
            {
                *printer << "Connection accepted, waiting for communication...";
            }

            if (!send_and_receive_until_close(client_sock))
                break;

            client_sock = INVALID_SOCKET;
        }

        if (!shut_client(client_sock))
            return;
        closesocket(client_sock);
        closesocket(server_sock);
        WSACleanup();
    }
};
