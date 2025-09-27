import type { Socket } from "socket.io";
import { SurveyResponse } from "../../../core/entities/surveys/survey_response.ts";
import type { DialogueContext } from "../entities/response_context.ts";
import { isPeerInputMalicious } from "./auth.ts";
import type { Model } from "./query_model/model.ts";
import { Turn } from "../../../core/entities/surveys/turn.ts";

function constructFullContext(
    promptContext: string,
    additionalResponses: Turn[]
): string {
    return `So far, in responding to this survey, the user has said ${promptContext}. Additionally, these questions from the model and answers from the users were added: ${additionalResponses
        .map((turn) => turn.respondentInputAndUserAnswerAsString)
        .join(" ")}`;
}

export function handlePeer(
    peer: Socket,
    context: DialogueContext,
    model: Model,
    surveyResponseInProgress: SurveyResponse
) {
    peer.on("respondent input", async (msg) => {
        // Parse user input for malicious messages
        const validatePeerInput = isPeerInputMalicious(msg);
        if (validatePeerInput) {
            peer.emit("error", validatePeerInput.message);
            return;
        }

        // Construct full context
        const fullContext = constructFullContext(
            context.promptContext,
            surveyResponseInProgress.fullTranscript
        );

        // Add a turn to our survey response
        const thisTurn = new Turn(undefined, msg);
        surveyResponseInProgress.addTurn(thisTurn);

        let modelAnswer: string = "";
        for await (const modelAnswerChunk of model.requestModelAnswerAsync(
            fullContext,
            msg
        )) {
            peer.emit("modelAnswerChunk", modelAnswerChunk);

            modelAnswer += modelAnswerChunk as string;
        }

        thisTurn.modelAnswer = modelAnswer;
    });
}
