#define LINUX

#ifndef HEADERS_FOR_IO_INCLUDED
#include "../headers/io/headers_for_io.h"
#define HEADERS_FOR_IO_INCLUDED
#endif

#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include <arpa/inet.h>
#include <memory>
#include <chrono>
#include <cmath>

#define INVALID_SOCKET -1
#define SOCKET int

class LinuxSocketIoImpl : public IOAsRunner
{
    CustomCout *&printer;
    CommandLineArguments &args;
    Runner *&runner;

private:
    // Reference: https://www.man7.org/linux/man-pages/man7/ip.7.html
    void config_addrinfo(sockaddr_in &address_info)
    {
        memset(&address_info, 0, sizeof(struct sockaddr_in));

        address_info.sin_family = AF_INET;
        address_info.sin_addr.s_addr = inet_addr("127.0.0.1");
        address_info.sin_port = htons((u_short)args.Port.value);
    }

    // Reference: https://www.man7.org/linux/man-pages/man3/strerror.3.html
    void print_socket_error(std::string &prepend)
    {
        *printer << prepend.append(strerror(errno));
    }

    bool initialize_socket(SOCKET &server_sock)
    {
        server_sock = socket(AF_INET, SOCK_STREAM, 0);
        if (server_sock == INVALID_SOCKET)
        {
            std::string e{"Error while creating socket: "};
            print_socket_error(e);
            return false;
        }
        return true;
    }

    // Reference: https://www.man7.org/linux/man-pages/man2/bind.2.html
    bool bind_socket(sockaddr_in &server_address_info, SOCKET &server_sock)
    {
        if (bind(server_sock, (struct sockaddr *)&server_address_info, sizeof(server_address_info)) == INVALID_SOCKET)
        {
            std::string e{"Error while binding: "};
            print_socket_error(e);
            return false;
        }
        return true;
    }

    // Reference: https://www.man7.org/linux/man-pages/man2/listen.2.html
    bool begin_listening(SOCKET &server_sock)
    {
        if (listen(server_sock, static_cast<int>(args.BacklogSize.value)) == INVALID_SOCKET)
        {
            std::string e{"Error on start listening: "};
            print_socket_error(e);
            return false;
        }
        return true;
    }

    bool configure(SOCKET &server_sock)
    {
        sockaddr_in address_info{};
        config_addrinfo(address_info);
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

    void print_server_sock_port(SOCKET &server_sock)
    {
        sockaddr_in socket_addr_info;
        uint size_of_socket_addr_info = sizeof(socket_addr_info);
        getsockname(server_sock, (struct sockaddr *)&socket_addr_info, &size_of_socket_addr_info);
        std::string o{"Bound socket listening on port "};
        *printer << o.append(std::to_string(ntohs(socket_addr_info.sin_port))).append("...");
    }

    // Reference: https://www.man7.org/linux/man-pages/man2/accept.2.html
    bool wait_for_connection(SOCKET &server_sock, SOCKET &client_sock)
    {
        client_sock = INVALID_SOCKET;
        client_sock = accept(server_sock, NULL, NULL);
        if (client_sock == INVALID_SOCKET)
        {
            std::string e{"Error while accepting connection: "};
            print_socket_error(e);
            return false;
        }
        return true;
    }

    // Start functions in which peer should know about error

    using Clock = std::chrono::time_point<std::chrono::system_clock>;

    bool should_timeout(Clock &start_time)
    {
        Clock now = std::chrono::system_clock::now();
        return std::chrono::duration<double>(now - start_time).count() > (double)args.MaxTransmissionWaitTimeSeconds.value;
    }

    void wait_for_transmission(SOCKET &client_sock, PeerCommunicationResult &res)
    {
        res.reset();

        ssize_t receive_result;
        char single_char_buffer{};

        std::chrono::time_point<std::chrono::system_clock> start = std::chrono::system_clock::now();

        while (!should_timeout(start))
        {
            receive_result = recv(client_sock, &single_char_buffer, 1, 0);

            if (check_for_socket_error(receive_result, printer, res))
                return;

            if (receive_result >= 1 && single_char_buffer == STX)
                return;
            if (receive_result >= 1 && single_char_buffer != STX)
            {
                res.set_failure("\tA socket connected, but sent a char which wasn't STX", printer);
                return;
            }
        }

        // Timeout
        res.set_failure("\tA socket connected, but either failed to send a EOT in their last message, or failed to send STX before timeout, which is set to " + std::to_string(args.MaxTransmissionWaitTimeSeconds.value) + " seconds", printer);
        return;
    }

    int get_max_number_of_digits()
    {
        return static_cast<int>(std::to_string(UINT_MAX).size()); // Up to uintmax = 4294967295 = 10 chars
    }

    bool check_for_socket_error(ssize_t result, CustomCout *&printer, PeerCommunicationResult &res)
    {
        if (result == INVALID_SOCKET)
        {
            std::string failure_message{"\tSending or receiving resulted in error: "};
            failure_message.append(strerror(errno));
            res.set_failure(failure_message, printer);
            return true;
        }
        return false;
    }

    void read_peer_reported_msg_length(SOCKET &client_sock, uint32_t &peer_reported_message_length, PeerCommunicationResult &res)
    {
        res.reset();

        int max_number_of_digits = get_max_number_of_digits();
        char *temp_char_buffer{new char[max_number_of_digits]};

        ssize_t receive_result;
        receive_result = recv(client_sock, temp_char_buffer, max_number_of_digits, 0);

        if (check_for_socket_error(receive_result, printer, res))
            return;
        if (receive_result < max_number_of_digits)
        {
            res.set_failure("Failed to read the 10 bytes that make up the message length, read " + std::to_string(receive_result) + " bytes", printer);
            return;
        }

        peer_reported_message_length = 0;
        for (int i{0}; i < max_number_of_digits; ++i)
        {
            peer_reported_message_length += static_cast<uint32_t>(((temp_char_buffer[i] - '0') * pow(10, max_number_of_digits - (i + 1))));
        }

        if (peer_reported_message_length > args.MaximumInputSizeBytes.value)
        {
            res.set_failure("Reported message length was larger than buffer size! Reported message length was " + std::to_string(peer_reported_message_length) + " while buffer size is " + std::to_string(args.MaximumInputSizeBytes.value), printer);
        }
        delete[] temp_char_buffer;
    }

    // Reference: https://man7.org/linux/man-pages/man2/recv.2.html
    void read_message(SOCKET &client_sock, uint32_t &peer_reported_message_length, std::unique_ptr<char[]> &receiving_buffer, PeerCommunicationResult &res)
    {
        res.reset();

        std::chrono::time_point<std::chrono::system_clock> start = std::chrono::system_clock::now();

        ssize_t recv_result_as_int{0};

        memset(receiving_buffer.get(), 0, peer_reported_message_length);
        uint32_t total_bytes_received = 0, last_request_bytes_received = 0;
        while (total_bytes_received != peer_reported_message_length && !should_timeout(start))
        {
            recv_result_as_int = recv(client_sock, receiving_buffer.get(), peer_reported_message_length - total_bytes_received, 0);

            if (check_for_socket_error(recv_result_as_int, printer, res))
                return;

            last_request_bytes_received = static_cast<uint32_t>(recv_result_as_int);
            total_bytes_received += last_request_bytes_received;

            if (last_request_bytes_received == 0 && total_bytes_received != peer_reported_message_length)
            {
                res.set_failure("While reading a message, received " + std::to_string(total_bytes_received) + ", but then received 0 more bytes. Expected " + std::to_string(peer_reported_message_length) + " bytes", printer);
                return;
            }
            if (should_timeout(start))
            {
                res.set_failure("Timeout while reading a message", printer);
                return;
            }
        }
        return;
    }

    void read_final_char_of_transmission(SOCKET &client_sock, char &peer_end_char, PeerCommunicationResult &res)
    {
        res.reset();

        ssize_t bytes_received = 0;
        bytes_received = recv(client_sock, &peer_end_char, 1, 0);
        if (check_for_socket_error(bytes_received, printer, res))
            return;
        if (bytes_received == 1)
            return;

        res.set_failure("Failed to read final char! Read " + std::to_string(bytes_received) + " bytes, expected to read a singular byte", printer);
        return;
    }

    void slice_c_char_arr_into_string(std::unique_ptr<char[]> &src, std::string &output, uint32_t slice_len)
    {
        char *dest = new char[slice_len + 1];
        strncpy(dest, src.get(), slice_len);
        dest[slice_len] = '\0';
        output = std::string{dest};
        delete[] dest;
    }

    void have_cache_process_peer_command(Command &command_for_runner, std::string &peer_command, std::string &cache_response, PeerCommunicationResult &res)
    {
        res.reset();

        runner->process_command(peer_command, command_for_runner, cache_response);
        if (cache_response == std::string{""})
        {
            res.set_failure("Peer sent quit command", printer);
            return;
        }

        return;
    }

    // End functions in which peer should know about error

    void convert_cache_message_to_protocol_format(std::string &message, size_t &message_in_protocol_format_length, bool processing_succeeded)
    {
        std::string start_char{char{STX}};

        std::string message_length{std::to_string(message.size())};
        message_length.insert(0, get_max_number_of_digits() - message_length.size(), '0');

        std::string end_char{processing_succeeded ? char{ETX} : char{NAK}};

        message = start_char.append(message_length).append(message).append(end_char);
        message_in_protocol_format_length = message.size();
    }

    // Reference: https://man7.org/linux/man-pages/man2/send.2.html
    bool send_message(SOCKET &client_sock, std::string &message, bool processing_succeeded)
    {
        size_t num_bytes_to_send;
        convert_cache_message_to_protocol_format(message, num_bytes_to_send, processing_succeeded);

        size_t num_bytes_sent{0};
        ssize_t last_send_num_bytes_sent;
        while (num_bytes_sent < num_bytes_to_send)
        {
            last_send_num_bytes_sent = send(client_sock, message.substr(num_bytes_sent).c_str(), static_cast<int>(num_bytes_to_send - num_bytes_sent), 0);
            if (last_send_num_bytes_sent == INVALID_SOCKET)
            {
                std::string e{"Failed to send with error: "};
                print_socket_error(e);
                return false;
            }
            if (last_send_num_bytes_sent == 0)
            {
                *printer << "Failed to send any bytes to peer!";
                return false;
            }

            num_bytes_sent += static_cast<size_t>(last_send_num_bytes_sent);
        }
        return true;
    }

    // Not needed since for linux no shutdown is necessary, however keep to make future abstraction easier
    bool shutdown_current_client(SOCKET &client_sock)
    {
        client_sock = client_sock;
        return true;
    }

    bool handle_one_peer(SOCKET &client_sock, std::unique_ptr<char[]> &receiving_buffer)
    {
        // For determining loop end
        char peer_ending_char{ETX};

        // Processing / communications failures which peer should know about
        PeerCommunicationResult res{};
        res.args = args;

        // For internal use by cache
        std::string a{}, b{}, c{};
        Command cmd{a, b, c};

        // For cache to put response in
        std::string cache_response;

        while (peer_ending_char == char{ETX})
        {
            // Wait for transmission
            if (args.verbose())
            {
                *printer << "  Waiting for transmission...";
            }
            wait_for_transmission(client_sock, res);
            if (!res.was_sucessful)
            {
                send_message(client_sock, res.failure_message, false);
                shutdown_current_client(client_sock);
                return 1;
            }

            // Read message length
            if (args.verbose())
            {
                *printer << "\tReading message length...";
            }
            uint32_t peer_reported_msg_length{0};
            read_peer_reported_msg_length(client_sock, peer_reported_msg_length, res);
            if (!res.was_sucessful)
            {
                send_message(client_sock, res.failure_message, false);
                shutdown_current_client(client_sock);
                return 1;
            }
            if (args.verbose())
            {
                *printer << "\tMessage length determined to be " + std::to_string(peer_reported_msg_length);
            }

            // Reading message
            if (args.verbose())
            {
                *printer << "\tReading message...";
            }
            read_message(client_sock, peer_reported_msg_length, receiving_buffer, res);
            std::string command_part_of_buffer;
            slice_c_char_arr_into_string(receiving_buffer, command_part_of_buffer, peer_reported_msg_length);
            if (!res.was_sucessful)
            {
                send_message(client_sock, res.failure_message, false);
                shutdown_current_client(client_sock);
                return 1;
            }
            if (args.verbose())
            {
                *printer << "\tSuccesfully read message of length " + std::to_string(peer_reported_msg_length) + ": " + command_part_of_buffer;
            }

            // Process command
            if (args.verbose())
            {
                *printer << "\tPassing command " + command_part_of_buffer + " to cache...";
            }

            have_cache_process_peer_command(cmd, command_part_of_buffer, cache_response, res);
            if (!res.was_sucessful)
            {
                send_message(client_sock, res.failure_message, 1);
                shutdown_current_client(client_sock);
                return 1;
            }
            if (args.verbose())
            {
                *printer << "\tReceived cache response " + cache_response;
            }

            // Send command response
            if (args.verbose())
            {
                *printer << "\tSending cache response to peer...";
            }
            if (!send_message(client_sock, cache_response, true))
            {
                shutdown_current_client(client_sock);
                return 1;
            }
            if (args.verbose())
            {
                *printer << "\tSuccessfully sent cache response " + cache_response + " to peer";
            }

            // Check final char - etx is wait for another communication, eot is end and wait for another connection, etb is end
            if (args.verbose())
            {
                *printer << "\tChecking final char from peer...";
            }
            read_final_char_of_transmission(client_sock, peer_ending_char, res);
            if (!res.was_sucessful)
            {
                send_message(client_sock, res.failure_message, false);
                shutdown_current_client(client_sock);
                return 1; // Failure, runner should continue
            }
        }
        if (peer_ending_char == char{EOT})
        {
            shutdown_current_client(client_sock);
            return 2; // Sucess, runner should continue
        }
        return 0; // Failure, runner should quit
    }

public:
    LinuxSocketIoImpl(CustomCout *&printer, CommandLineArguments &args, Runner *&runner) : printer{printer}, args{args}, runner{runner} {};
    ~LinuxSocketIoImpl() { delete printer; };
    LinuxSocketIoImpl(const LinuxSocketIoImpl &l) : printer{l.printer}, args{l.args}, runner{l.runner} {};
    LinuxSocketIoImpl &operator=(const LinuxSocketIoImpl &l)
    {
        delete this->printer;
        this->printer = l.printer;
        this->args = l.args;
        this->runner = l.runner;
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

        // Create buffer
        if (args.verbose())
        {
            *printer << "Creating buffer...";
        }
        std::unique_ptr<char[]> receiving_buffer;
        try
        {
            receiving_buffer = std::make_unique<char[]>(args.MaximumInputSizeBytes.value);
        }
        catch (std::bad_alloc const &)
        {
            *printer << "Failed to create buffer of size " + std::to_string(args.MaximumInputSizeBytes.value) + ". Exiting...";
            return;
        }
        // 0 = cache should quit, 1 = failure, cache should continue, 2 = success, cache should continue
        int peer_handler_response_code;
        while (true)
        {
            // Wait for a new connection
            if (args.verbose())
            {
                *printer << "Waiting for connection...";
            }
            if (!wait_for_connection(server_sock, client_sock))
                break;

            *printer << "Connection accepted, waiting for communication...";

            Clock before_handle, after_handle;
            if (args.timed())
            {
                before_handle = std::chrono::system_clock::now();
            }
            peer_handler_response_code = handle_one_peer(client_sock, receiving_buffer);
            if (args.timed())
            {
                after_handle = std::chrono::system_clock::now();
                double connection_length = std::chrono::duration<double>(after_handle - before_handle).count();
                *printer << "Connection handled in " + std::to_string(connection_length) + " seconds";
            }

            if (peer_handler_response_code == 0)
            {
                *printer << "Peer ordered cache shutdown, exiting...";
                break;
            }

            client_sock = INVALID_SOCKET;
        }
        // Reference: https://www.man7.org/linux/man-pages/man2/shutdown.2.html
        shutdown(server_sock, SHUT_RDWR);
    }
};
