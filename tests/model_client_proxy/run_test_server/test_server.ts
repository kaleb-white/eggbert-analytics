import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { handlePeer } from "../../../model_client_proxy/core/use_cases/handle_peer";
import { DialogueContext } from "../../../model_client_proxy/core/entities/dialogue_context";
import { ModelTest } from "../../../model_client_proxy/core/gateways/external/query_model/test_model";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";

function test_server() {
    // Server setup
    const app = express();
    app.use(express.json());
    const server = createServer(app);
    const io = new Server(server);

    // Add additional callbacks here
    const responseForPeerHandler: Response = new Response({
        questionResponses: [new QuestionResponse({ uniqueId: "test" })],
    });
    const contextForPeerHandler: DialogueContext = new DialogueContext(
        "abc",
        responseForPeerHandler
    );
    const testModelForPeerHandler: ModelTest = new ModelTest();

    io.on("connection", (peer) => {
        handlePeer(
            peer,
            contextForPeerHandler,
            testModelForPeerHandler,
            responseForPeerHandler
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
