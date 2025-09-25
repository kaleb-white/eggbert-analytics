import { describe, test, expect } from "bun:test";
import { io } from "socket.io-client";
import { ConnectionSetup } from "./core/entities/connection_setup";

const PORT = 1038;

type AvailableRoutes = "create-connection" | "connection-ids";

async function call(
    route: AvailableRoutes,
    method: string,
    body: string = "",
    authorization: string = ""
) {
    const full_route = `localhost:${PORT}/${route}`;

    if (body == "") {
        return await fetch(full_route, {
            headers: {
                authorization: authorization,
            },
        });
    }

    return await fetch(full_route, {
        method: `${method}`,
        headers: {
            "Content-Type": "application/json",
            authorization: authorization,
        },
        body: body,
    });
}

describe("test model client proxy integration", () => {
    describe("test create-connection", () => {
        const serverToken = process.env.EXPECTED_SERVER_TOKEN as string;
        const setup: ConnectionSetup = new ConnectionSetup(
            "abc",
            "a",
            serverToken,
            "a"
        );

        test("create-connection rejects incorrect server token", async () => {
            setup.serverToken = "peepee";
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(setup),
                serverToken
            );
            expect(res.status).toBe(401);
        });

        test("create-connection rejects missing server token", async () => {
            const setupWithoutServerToken = {
                connectionId: "abc",
                context: "abc",
                peerAddress: "abc",
            };
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(setupWithoutServerToken),
                serverToken
            );
            expect(res.status).toBe(401);
        });

        test("create-connection rejects missing field", async () => {
            const setupWithoutConnectionId = {
                context: "abc",
                serverToken: serverToken,
                peerAddress: "abc",
            };
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(setupWithoutConnectionId),
                serverToken
            );
            expect(res.status).toBe(400);
        });

        test("create connection plus connection ids returns expected value after one call", async () => {
            setup.serverToken = serverToken;

            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(setup),
                serverToken
            );

            expect(res.status).toBe(200);

            const connectionIdsResponse = await call(
                "connection-ids",
                "GET",
                "",
                serverToken
            );

            const connectionIdsResponseBody = connectionIdsResponse.body;
            expect(await connectionIdsResponseBody?.text()).toBe('["abc"]');
        });

        test("test connection to socket", async () => {
            setup.connectionId = "test-connect";
            await call(
                "create-connection",
                "POST",
                JSON.stringify(setup),
                serverToken
            );

            const server = io(`http://localhost:${PORT}`, {
                extraHeaders: {
                    connectionId: "test-connect",
                },
            });

            let expected_value = "";
            server.on("connect", () => {
                console.log("connected to server");
                server.emit("input", "abc");
            });
            server.on("response", (msg) => {
                console.log(msg);
                expected_value = "msg";
            });

            await new Promise<void>((resolve) => {
                function chooseToResolve() {
                    if (expected_value == "") {
                        setTimeout(chooseToResolve, 1000);
                    } else resolve();
                }
                chooseToResolve();
            });
        });
    });
});
