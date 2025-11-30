import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { handlePeer } from "../../../model_client_proxy/core/use_cases/handle_peer";
import { DialogueContext } from "../../../model_client_proxy/core/entities/dialogue_context";
import { ModelTest } from "../../../model_client_proxy/core/gateways/external/query_model/test_model";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";

import { Survey } from "@/core/entities/surveys/survey";
import { Author } from "@/core/entities/users/author";
import { Question } from "@/core/entities/surveys/question";
import { storage, testInitializer } from "@/injections";

async function test_server() {
    // Db reset
    await testInitializer.removeAllRows();

    // Server setup
    const app = express();
    app.use(express.json());
    const server = createServer(app);
    const io = new Server(server);

    // Survey so we are not violating foreign key on response
    const q = new Question({
        uniqueId: "sampleQuestion",
        surveyId: "sampleSurvey",
    });
    const surveyToContainResponse = new Survey({
        uniqueId: "sampleSurvey",
        author: new Author(),
        questions: [q],
    });
    const saveSurveyResult = await storage.save(
        surveyToContainResponse.uniqueId,
        surveyToContainResponse
    );

    if (saveSurveyResult) {
        console.log("failed to save survey:", saveSurveyResult.message);
        return;
    }

    // Add additional callbacks here
    const responseForPeerHandler: Response = new Response({
        questionResponses: [
            new QuestionResponse({ uniqueId: "test", question: q }),
        ],
        surveyId: "sampleSurvey",
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

await test_server();
