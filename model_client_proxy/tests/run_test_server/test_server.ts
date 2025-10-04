import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { handlePeer } from "../../core/use_cases/handle_peer";
import { DialogueContext } from "../../core/entities/dialogue_context";
import { ModelTest } from "../../core/use_cases/query_model/test_model";
import { Question } from "../../../core/entities/surveys/question";
import { QuestionResponse } from "../../../core/entities/surveys/question_response";

function test_server() {
    // Server setup
    const app = express();
    app.use(express.json());
    const server = createServer(app);
    const io = new Server(server);

    // Add additional callbacks here
    const contextForPeerHandler: DialogueContext = new DialogueContext(
        "abc",
        "",
        new Question("prompt")
    );
    const testModelForPeerHandler: ModelTest = new ModelTest();
    const questionResponseForPeerHandler: QuestionResponse =
        new QuestionResponse("a", new Question("a"));
    io.on("connection", (peer) => {
        handlePeer(
            peer,
            contextForPeerHandler,
            testModelForPeerHandler,
            questionResponseForPeerHandler
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
