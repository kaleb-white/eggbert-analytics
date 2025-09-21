# A Simple Cache Implementation

A very simple implementation of an in-memory cache. There is an IO implementation for the winsock2 windows header; but no implementation yet exists for windows.

## Options

Arguments are found in the args.h header. After arguments are parsed, a `CommandLineArguments` object is passed around which contains the value of each argument.

Extending the allowed arguments is as simple as registering a new argument in the `CommandLineArguments` struct and adding it to the `all_arguments` array.

| Name                                  | Argument                   | Default Value                               | Help Message                                                                                                                                                                     |
| ------------------------------------- | -------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Max Memory in Bytes                   | -max-memory=               | 1000000000 bytes, 100 MB                    | The max allowable memory in bytes for the cache to use. Defaults to 100Mb. Does not necessarily describe the total size of the program, just the size of the cache and the LRU.  |
| Timed                                 | -t=                        | 0                                           | When set, prints additional timing information while the program is running.                                                                                                     |
| Verbose                               | -v=                        | 0                                           | When set, prints additional information while the program is running. Significantly degrades performance beause of large number of system calls.                                 |
| Port                                  | -port=                     | 1037 (random I picked :))                   | The port to bind to.                                                                                                                                                             |
| Backlog Size                          | -backlog-size=             | SOMAXCONN (ws2tcpip header val, 0x7fffffff) | The number of connections to allow in a backlong.                                                                                                                                |
| Maximum Input Size in Bytes           | -max-input-size-bytes=     | 100000 bytes, 100KB                         | The max number of bytes to buffer from the client.                                                                                                                               |
| Number of Ids to Remove at Size Limit | -delete-on-mem-limit-reach | 5                                           | When the max limit size is reached, the cache will delete ids until it reaches below the max memory size. The increment it goes at is described by NumberIdsToRemoveAtSizeLimit. |
| Help                                  | -h                         |                                             |                                                                                                                                                                                  |
| Max Transmission Wait Time in Seconds | -max-wait-time=            | 10 seconds                                  | When the cache accepts a connection, it will continuously read bytes from the connection until it reads and STX, or until the time exceeds MaxTransmissionWaitTimeSeconds.       |

## Socket Protocol

### Message protocol

A message to the server from the client: ==STX (start message)== -> ==uint peer_reported_message_len, left zero padded to 10 digits, the number of digits in UINT_MAX== -> ==message of length peer_reported_message_len== -> ==ETX (end message) | EOT (end and reset client socket) | ETB (end and shut cache)==

A message to the client from the server: ==STX (start message)== -> ==uint peer_reported_message_len, left zero padded to 10 digits, the number of digits in UINT_MAX== -> ==message of length peer_reported_message_len== -> ==ETX (end message)==

#define STX 0x02
#define ETX 0x03
#define EOT 0x04
#define ETB 0x17

### Server state machine

1. Initialization at predetermined port
    1. Failure: exit
1. Wait for connection
    1. Failure: exit
1. Wait for transmission by reading a char
    1. Failure: wait for conneciton
1. Read a uint (10 digits)
    1. Failure: wait for connection
1. Read a message
    1. Failure: wait for connection
1. Send message to cache
    1. Failure: wait for connection
    1. Success: send cache response to connection and continue
1. Read a char
    1. Failure: wait for connection
    1. EOB: shut socket
    1. EOT: wait for connection
    1. ETX: wait for transmission
