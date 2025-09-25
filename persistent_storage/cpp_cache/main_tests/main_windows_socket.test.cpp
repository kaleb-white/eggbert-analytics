#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#define DOCTEST_CONFIG_SUPER_FAST_ASSERTS
#include "doctest/doctest.h"

#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdlib.h>
#include <stdio.h>
#include <cstdlib>
#include <array>
#include <chrono>
#include <climits>

// Change according to defaults in constants.h
#define DEFAULT_BUFLEN 100000
#define DEFAULT_PORT "1037"

#define STX 0x02
#define ETX 0x03
#define EOT 0x04
#define ETB 0x17

#pragma GCC diagnostic ignored "-Wstringop-truncation"

int socket_setup(SOCKET &ConnectSocket)
{
    WSADATA wsaData;
    int iResult;

    sockaddr_in address_info{};
    memset(&address_info, 0, sizeof(struct sockaddr_in));
    address_info.sin_family = AF_INET;
    address_info.sin_addr.s_addr = inet_addr("127.0.0.1");
    address_info.sin_port = htons(1037);

    // Initialize Winsock
    iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (iResult != 0)
    {
        printf("WSAStartup failed with error: %d\n", iResult);
        return 1;
    }

    // Create a SOCKET for connecting to server
    ConnectSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (ConnectSocket == INVALID_SOCKET)
    {
        printf("socket failed with error: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    // Connect to server.
    iResult = connect(ConnectSocket, (sockaddr *)&address_info, (int)sizeof(address_info));
    if (iResult == SOCKET_ERROR)
    {
        closesocket(ConnectSocket);
        ConnectSocket = INVALID_SOCKET;
    }

    if (ConnectSocket == INVALID_SOCKET)
    {
        printf("Unable to connect to server!\n");
        WSACleanup();
        return 1;
    }
    return 0;
}

void convert_message_to_protocol_format(std::string &message, const bool end_of_transmission, const bool close_socket)
{
    std::string start_char{char{STX}};

    std::string message_length{std::to_string(message.size())};
    message_length.insert(0, 10 - message_length.size(), '0');

    std::string end_char{close_socket ? char{ETB} : end_of_transmission ? char{EOT}
                                                                        : char{ETX}};

    message = start_char.append(message_length).append(message).append(end_char);
}

int send_and_recv(SOCKET &ConnectSocket, std::string &message, std::string &recv_string, const bool eot = false, const bool close_socket = false)
{
    convert_message_to_protocol_format(message, eot, close_socket);

    int iResult{0}, temp_result_store;
    while (iResult < (int)strlen(message.c_str()))
    {
        temp_result_store = send(ConnectSocket, message.substr(iResult).c_str(), (int)strlen(message.c_str()) - iResult, 0);
        if (temp_result_store == SOCKET_ERROR)
        {
            printf("send failed with error: %d\n", WSAGetLastError());
            closesocket(ConnectSocket);
            WSACleanup();
            return 1;
        }
        iResult += temp_result_store;
    }

    char recv_buffer[DEFAULT_BUFLEN]{};
    iResult = recv(ConnectSocket, recv_buffer, 11, 0);
    if (iResult < 11)
    {
        printf(std::string{"failed to get length of message, read " + std::to_string(iResult) + " bytes, which were " + recv_buffer + '\n'}.c_str());
        return 1;
    }
    char tmp[11];
    strncpy(tmp, recv_buffer, 11);
    long length = std::stol(std::string{tmp + 1});

    memset(recv_buffer, 0, length);
    iResult = 0;
    while (iResult < length)
    {
        temp_result_store = recv(ConnectSocket, recv_buffer, length - iResult, 0);

        if (temp_result_store == 0)
        {
            printf("Expected to receive more bytes but did not\n");
            return 1;
        }
        else if (!(temp_result_store > 0))
        {
            printf("recv failed with error: %d\n", WSAGetLastError());
            return 1;
        };
        iResult += temp_result_store;
    }

    char end_char;
    iResult = recv(ConnectSocket, &end_char, 1, 0);

    char *tmp2 = new char[length + 1];
    strncpy(tmp2, recv_buffer, length); // Slice off protocol, 1 byte for STX, 10 for transmission length
    tmp2[length] = '\0';
    recv_string = tmp2;
    return 0;
}

void teardown(SOCKET &ConnectSocket)
{
    std::string msg{""};
    std::string rcv{""};
    send_and_recv(ConnectSocket, msg, rcv, true);
    int iResult = shutdown(ConnectSocket, SD_SEND);
    if (iResult == SOCKET_ERROR)
    {
        printf("shutdown failed with error: %d\n", WSAGetLastError());
        closesocket(ConnectSocket);
        WSACleanup();
    }
    closesocket(ConnectSocket);
    WSACleanup();
}

void repeat_string_n_times(size_t n, std::string str, std::string &output)
{
    output = "";
    for (size_t i{0}; i < n; ++i)
    {
        output.append(str);
    }
}

char get_rand_char()
{
    return static_cast<char>((std::rand() * (126 - 33) / RAND_MAX) + 33);
}

TEST_CASE("test windows socket")
{
    SOCKET client_sock = INVALID_SOCKET;
    if (socket_setup(client_sock) == 1)
        throw std::string("Setup failed");

    std::string recv_buffer{};
    std::string msg{};
    std::string scrap{};
    int call_res;

    SUBCASE("test basic send and receive")
    {
        msg = "create id a";
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read id";
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == "a");
    }

    SUBCASE("test mass send and read")
    {
        for (size_t i{0}; i < 10000; ++i)
        {
            msg = "create ";
            msg.append("a");
            msg.append(" a");
            call_res = send_and_recv(client_sock, msg, recv_buffer);

            if (i % 10 == 0)
            {
                msg = "read ";
                msg.append("a");
                msg.append(scrap);
                call_res = send_and_recv(client_sock, msg, recv_buffer);
                CHECK(call_res == 0);
                CHECK(recv_buffer == "a");
            }
        }
    }

    // SUBCASE("time mass create")
    // {
    //     size_t num_rqs{100000};
    //     std::chrono::time_point<std::chrono::steady_clock> before = std::chrono::steady_clock::now();
    //     for (size_t i{0}; i < num_rqs; ++i)
    //     {
    //         msg = "create a a";
    //         call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     }
    //     std::chrono::time_point<std::chrono::steady_clock> after = std::chrono::steady_clock::now();
    //     double connection_length = std::chrono::duration<double>(after - before).count();
    //     std::string output{"Sent " + std::to_string(num_rqs) + " requests in " + std::to_string(connection_length) + " seconds"};
    //     MESSAGE(output);
    // }

    SUBCASE("time mass create and read")
    {
        const size_t num_rqs{1000};
        const int max_key_length{1000};

        std::array<std::string, num_rqs> *create_commands{new std::array<std::string, num_rqs>{}};
        (*create_commands).fill("create ");
        std::array<std::string, num_rqs> *read_commands{new std::array<std::string, num_rqs>{}};
        (*read_commands).fill("read ");
        std::string key{}, val{};

        for (size_t i{0}; i < num_rqs; ++i)
        {
            key = "";
            val = "";
            int random_key_size = std::min(static_cast<int>(std::rand() * max_key_length / RAND_MAX), max_key_length);
            for (int j{0}; j < random_key_size + 1; ++j)
            {
                key += get_rand_char();
            }
            (*create_commands).at(i).append(key).append(" ");
            (*read_commands).at(i).append(key);

            int random_value_size = std::min(static_cast<int>(std::rand() * max_key_length / RAND_MAX), max_key_length);
            for (int j{0}; j < random_value_size + 1; ++j)
            {
                val += get_rand_char();
            }
            (*create_commands).at(i).append(val);
        }

        std::chrono::time_point<std::chrono::steady_clock> before = std::chrono::steady_clock::now();
        for (size_t i{0}; i < num_rqs; ++i)
        {
            send_and_recv(client_sock, (*create_commands)[i], recv_buffer);
            call_res = send_and_recv(client_sock, (*read_commands)[i], recv_buffer);
        }
        std::chrono::time_point<std::chrono::steady_clock> after = std::chrono::steady_clock::now();
        double connection_length = std::chrono::duration<double>(after - before).count();

        std::string timing{"Sent " + std::to_string(num_rqs) + " requests in " + std::to_string(connection_length) + " seconds"};
        MESSAGE(timing);

        std::string last_two_commands_result{"Last two commands sent were:\n\n" + (*create_commands)[(*create_commands).size() - 1] + "\n\nand\n\n" + (*read_commands)[(*read_commands).size() - 1] + "\n\nto which the cache responded\n\n" + recv_buffer};
        MESSAGE(last_two_commands_result);

        CHECK(call_res == 0);

        delete create_commands;
        delete read_commands;
    }

    // SUBCASE("test delete")
    // {
    //     msg = "create abcd c";
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "delete abcd";
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read abcd";
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     MESSAGE(recv_buffer);
    // }

    // SUBCASE("test long id and value")
    // {
    //     // 20 chars
    //     msg = "create ";
    //     repeat_string_n_times(20, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     // 40 chars
    //     msg = "create ";
    //     repeat_string_n_times(40, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);
    //     CHECK(recv_buffer == scrap);

    //     // 80 chars
    //     msg = "create ";
    //     repeat_string_n_times(80, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 160 chars
    //     msg = "create ";
    //     repeat_string_n_times(160, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 320 chars
    //     msg = "create ";
    //     repeat_string_n_times(320, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 640 chars
    //     msg = "create ";
    //     repeat_string_n_times(640, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 1280 chars
    //     msg = "create ";
    //     repeat_string_n_times(1280, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 2560 chars
    //     msg = "create ";
    //     repeat_string_n_times(2560, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 5120 chars
    //     msg = "create ";
    //     repeat_string_n_times(5120, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);

    //     // 9999 chars
    //     msg = "create ";
    //     repeat_string_n_times(9999, "a", scrap);
    //     msg.append(scrap).append(" ").append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read ";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);
    // }

    // SUBCASE("Test create with spaces in value")
    // {
    //     msg = "create jadhfj ";
    //     scrap = "abc def ghi";
    //     msg.append(scrap);
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);

    //     msg = "read jadhfj";
    //     call_res = send_and_recv(client_sock, msg, recv_buffer);
    //     CHECK(call_res == 0);
    //     CHECK(recv_buffer == scrap);
    // }

    teardown(client_sock);
}
