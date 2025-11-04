import { describe, expect, test } from "bun:test";
import { spawnAsyncTestServer } from "../run_test_server/run_test_server";
import { io } from "socket.io-client";

// Create server instance that will handle a client connection
spawnAsyncTestServer();

describe("test use case handle peer", () => {
    // Peer to connect with
    const peer = io("http://localhost:1313");

    test("test handle_peer respondent input callback", async () => {
        let expected_value = "";
        let called = 0;

        // First test model sends the context it was called with, then the user input - which, in our case, should be message
        peer.on("modelMessageChunk", (msg) => {
            expected_value = msg;
            called += 1;

            if (called == 2) {
                expect(msg).toBe("my message");
            }
        });
        peer.on("error", (err) => {
            console.log("Error", err);
            expect(err).fail();
        });

        peer.emit("respondent input", "my message", "test");

        // Wait until we've received something
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
