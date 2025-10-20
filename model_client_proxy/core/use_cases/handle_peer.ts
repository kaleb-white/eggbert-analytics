import type { Socket } from "socket.io";
import { QuestionResponse } from "../../../core/entities/surveys/question_response.ts";
import type { DialogueContext } from "../entities/dialogue_context.ts";
import { isPeerInputMalicious } from "./auth.ts";
import type { Model } from "../gateways/interfaces/external/model.ts";
import { Turn } from "../../../core/entities/surveys/turn.ts";
import { DEV } from "../../main.ts";

const space6 = "      ";
const space8 = "        ";

function constructFullContext(
    promptContext: string,
    additionalResponses: Turn[]
): string {
    return `So far, in responding to this survey, the user has said ${promptContext}. Additionally, these questions from the model and answers from the users were added: ${additionalResponses
        .map((turn) => turn.respondentMessageAndUserAnswerAsString)
        .join(" ")}`;
}

export function handlePeer(
    peer: Socket,
    context: DialogueContext,
    model: Model,
    questionResponseInProgress: QuestionResponse
) {
    peer.on("respondent input", async (msg) => {
        if (DEV) {
            console.log(
                space6,
                "ConnectionId",
                peer.handshake.auth.connectionId,
                "sent message:",
                msg
            );
        }

        // Parse user input for malicious messages
        const validatePeerInput = isPeerInputMalicious(msg);
        if (validatePeerInput) {
            peer.emit("error", validatePeerInput.message);
            return;
        }
        if (DEV) {
            console.log(space8, "Input validated");
        }

        // Construct full context
        const fullContext = constructFullContext(
            context.promptContext,
            questionResponseInProgress.transcript
        );
        if (DEV) {
            console.log(space8, "Context constructed");
        }

        // Add a turn to our survey response
        const thisTurn = new Turn(undefined, msg);
        questionResponseInProgress.addTurn(thisTurn);

        if (DEV) {
            console.log(space8, "Awaiting model...");
        }
        let modelMessage: string = "";
        for await (const modelMessageChunk of model.requestModelAnswerAsync(
            fullContext,
            msg
        )) {
            peer.emit("modelMessageChunk", modelMessageChunk);

            modelMessage += modelMessageChunk as string;
        }
        if (DEV) {
            console.log(space8, "Model finished");
        }

        // Tell peer model is finished
        peer.emit("modelMessageFinished");
        if (DEV) {
            console.log(space8, "Informed peer model finished");
        }

        thisTurn.modelMessage = modelMessage;
    });
}
