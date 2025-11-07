# Model Client Proxy

Client sends server request to get survey responses so far. The Server responds with they survey responses. The client then requests a connection to the proxy. The server then sends the model client proxy a request on the /create-connection route, to which the model client proxy responds with success or failure. On failure, the server lets the client know what happened. On success, the server returns the address to connect to, and the connection id. The client then connects to the model client proxy. The proxy doesn't do anything on connection except set a timeout after which it closes.

add socket callbacks to test server manually at ./tests/run_test_server/test_server.ts, sadly callbacks can't be used with mocks afaik. Test server runs on port 1313. call `spawnAsyncTestServer()` to start the test server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
