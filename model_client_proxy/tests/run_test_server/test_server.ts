import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { handlePeer } from "../../core/use_cases/handle_peer";
import { DialogueContext } from "../../core/entities/dialogue_context";
import { ModelTest } from "../../core/gateways/external/query_model/test_model";
import { Response } from "../../../core/entities/surveys/response";
import { storage } from "../../../injections";

function test_server() {
    // Server setup
    const app = express();
    app.use(express.json());
    const server = createServer(app);
    const io = new Server(server);

    // Add additional callbacks here
    const contextForPeerHandler: DialogueContext = new DialogueContext(
        "abc",
        new Response()
    );
    const testModelForPeerHandler: ModelTest = new ModelTest();
    const responseForPeerHandler: Response = new Response({ uniqueId: "a" });
    io.on("connection", (peer) => {
        handlePeer(
            peer,
            contextForPeerHandler,
            testModelForPeerHandler,
            responseForPeerHandler,
            async (r: Response) => {
                const saveResult = await storage.save(r.uniqueId, r);
                return saveResult;
            } // Note: DOES NOT TEST ROUTE ON MAIN SERVER!
        );
    });

    const timeoutLengthMs = 5000;
    setTimeout(() => {
        console.log("test server timed out after", timeoutLengthMs, "ms");
        server.closeAllConnections();
        server.close();
    }, timeoutLengthMs);

    server.listen(1313, () => {
        console.log("test server started");
    });
}

test_server();
