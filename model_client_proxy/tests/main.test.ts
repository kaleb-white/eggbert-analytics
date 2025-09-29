import { describe, test, expect } from "bun:test";
import { io } from "socket.io-client";
import { ConnectionSetup } from "../core/entities/connection_setup";
import { ClientGatewayImpl } from "../core/gateways/client_gateway/client";

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
            "a",
            "a"
        );

        const body = {
            serverToken: serverToken,
            connectionSetup: setup,
        };

        test("create-connection rejects incorrect server token", async () => {
            body.serverToken = "pee pee";
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(body)
            );
            expect(res.status).toBe(401);
        });

        test("create-connection rejects missing server token", async () => {
            const noServerToken = {
                connectionSetup: {
                    connectionId: "abc",
                    context: "abc",
                    peerAddress: "abc",
                },
            };
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(noServerToken),
                serverToken
            );
            expect(res.status).toBe(401);
        });

        test("create-connection rejects missing field", async () => {
            const bodyMissingField = {
                serverToken: serverToken,
                connectionSetup: {
                    context: "abc",
                    serverToken: serverToken,
                    peerAddress: "abc",
                },
            };
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(bodyMissingField),
                serverToken
            );
            expect(res.status).toBe(400);
        });

        test("create connection plus connection ids returns expected value after one call", async () => {
            body.serverToken = serverToken;
            const res = await call(
                "create-connection",
                "POST",
                JSON.stringify(body),
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
                JSON.stringify(body),
                serverToken
            );

            const client = new ClientGatewayImpl();

            let expected_value = "";

            client.start(
                `http://localhost:${PORT}`,
                "test-connect",
                (modelChunk) => {
                    expected_value = modelChunk;
                    console.log(expected_value);
                }
            );
            const sendResult = client.sendRespondentInput("my input");

            expect(sendResult).toBe(null);

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
