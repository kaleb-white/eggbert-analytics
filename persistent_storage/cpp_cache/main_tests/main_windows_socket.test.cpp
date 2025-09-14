#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#define DOCTEST_CONFIG_SUPER_FAST_ASSERTS
#include "doctest/doctest.h"

#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdlib.h>
#include <stdio.h>

// Change according to defaults in constants.h
#define DEFAULT_BUFLEN 10000
#define DEFAULT_PORT "1037"

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

int send_and_recv(SOCKET &ConnectSocket, std::string &message, std::string &recv_string)
{
    int iResult{};
    iResult = send(ConnectSocket, message.c_str(), (int)strlen(message.c_str()), 0);
    if (iResult == SOCKET_ERROR)
    {
        printf("send failed with error: %d\n", WSAGetLastError());
        closesocket(ConnectSocket);
        WSACleanup();
        return 1;
    }

    char recv_buffer[DEFAULT_BUFLEN]{};

    iResult = recv(ConnectSocket, recv_buffer, DEFAULT_BUFLEN, 0);
    if (iResult == 0)
    {
        printf("Connection closed\n");
        return 1;
    }
    else if (!(iResult > 0))
    {
        printf("recv failed with error: %d\n", WSAGetLastError());
        return 1;
    };

    recv_string = recv_buffer;

    return 0;
}
void teardown(SOCKET &ConnectSocket)
{
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

    // SUBCASE("test mass send and read")
    // {
    //     for (size_t i{0}; i < 10000; ++i)
    //     {
    //         msg = "create ";
    //         msg.append("a");
    //         msg.append(" a");
    //         call_res = send_and_recv(client_sock, msg, recv_buffer);

    //         if (i % 10 == 0)
    //         {
    //             msg = "read ";
    //             msg.append("a");
    //             msg.append(scrap);
    //             call_res = send_and_recv(client_sock, msg, recv_buffer);
    //             CHECK(call_res == 0);
    //             CHECK(recv_buffer == "a");
    //         }
    //     }
    // }

    SUBCASE("test delete")
    {
        msg = "create abcd c";
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "delete abcd";
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read abcd";
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        MESSAGE(recv_buffer);
    }

    SUBCASE("test long id and value")
    {
        // 20 chars
        msg = "create ";
        repeat_string_n_times(20, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        // 40 chars
        msg = "create ";
        repeat_string_n_times(40, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);
        CHECK(recv_buffer == scrap);

        // 80 chars
        msg = "create ";
        repeat_string_n_times(80, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);

        // 160 chars
        msg = "create ";
        repeat_string_n_times(160, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);

        // 320 chars
        msg = "create ";
        repeat_string_n_times(320, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);

        // 640 chars
        msg = "create ";
        repeat_string_n_times(640, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);

        // 1280 chars
        msg = "create ";
        repeat_string_n_times(1280, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);

        // 2560 chars
        msg = "create ";
        repeat_string_n_times(2560, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);

        // 5120 chars
        msg = "create ";
        repeat_string_n_times(5120, "a", scrap);
        msg.append(scrap).append(" ").append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);

        msg = "read ";
        msg.append(scrap);
        call_res = send_and_recv(client_sock, msg, recv_buffer);
        CHECK(call_res == 0);
        CHECK(recv_buffer == scrap);
    }

    teardown(client_sock);
}
