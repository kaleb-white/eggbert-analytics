import type { Socket } from "socket.io";
import { Response } from "../../../core/entities/surveys/response.ts";
import type { DialogueContext } from "../entities/dialogue_context.ts";
import { isPeerInputMalicious } from "./auth.ts";
import type { Model } from "../gateways/interfaces/external/model.ts";
import { Turn } from "../../../core/entities/surveys/turn.ts";
import type { QuestionResponse } from "../../../core/entities/surveys/question_response.ts";
import { proxy_debug } from "../../../utilities/verbose_checks.ts";
import type { responseSaver } from "../gateways/interfaces/internal/response_saver.ts";
import { uniqueIdGen } from "../../../core/injections.ts";

const space6 = "      ";
const space8 = "        ";

function turnsToContext(turns: Turn[]) {
    const preamble =
        "Additionally, these questions from the model and answers from the users were added: ";
    let context = preamble;
    turns.map((t) => {
        context = context.concat(
            "Model said: ",
            t.modelMessage,
            " Respondent said: ",
            t.respondentMessage
        );
    });
    return context;
}

function constructFullContext(promptContext: string, turns: Turn[]): string {
    return `So far, in responding to this survey, the user has said ${promptContext}. ${turnsToContext(
        turns
    )}`;
}

export function handlePeer(
    peer: Socket,
    context: DialogueContext,
    model: Model,
    responseInProgress: Response,
    responseSaver: responseSaver
) {
    peer.on(
        "respondent input",
        async (respondentMessage, questionResponseId) => {
            if (proxy_debug()) {
                console.log(
                    space6,
                    "ConnectionId",
                    peer.handshake.auth.connectionId,
                    "sent message:",
                    respondentMessage,
                    "to questionResponse with id:",
                    questionResponseId
                );
            }

            // Check that both params were received
            if (!respondentMessage || !questionResponseId) {
                peer.emit(
                    "error",
                    `Expected respondentMessage and questionResponseId to be defined but received respondentMessage ${respondentMessage} and questionResponseId ${questionResponseId}`
                );
                return;
            }

            // Parse user input for malicious messages
            const validatePeerInput = isPeerInputMalicious(respondentMessage);
            if (validatePeerInput) {
                peer.emit("error", validatePeerInput.message);
                return;
            }

            if (proxy_debug()) {
                console.log(space8, "Input validated");
            }

            // Check that questionResponseId is valid
            const matchingQrs = responseInProgress.questionResponses.filter(
                (qr) => qr.uniqueId == questionResponseId
            );
            if (matchingQrs.length != 1) {
                peer.emit(
                    "error",
                    `Question response with id ${questionResponseId} not found!`
                );
                return;
            }
            if (proxy_debug()) {
                console.log(space8, "Question response identified");
            }
            const questionResponseInProgress =
                matchingQrs[0] as QuestionResponse;

            // Construct full context
            const fullContext = constructFullContext(
                context.promptContext,
                questionResponseInProgress.transcript
            );
            if (proxy_debug()) {
                console.log(space8, "Context constructed");
            }

            if (proxy_debug()) {
                console.log(space8, "Awaiting model...");
            }
            let modelMessage: string = "";
            for await (const modelMessageChunk of model.requestModelAnswerAsync(
                fullContext,
                respondentMessage
            )) {
                peer.emit("modelMessageChunk", modelMessageChunk);

                modelMessage += modelMessageChunk as string;
            }
            if (proxy_debug()) {
                console.log(space8, "Model finished");
            }

            // Tell peer model is finished
            peer.emit("modelMessageFinished");
            if (proxy_debug()) {
                console.log(space8, "Informed peer model finished");
            }

            // Update the response in progress
            const lastTurn =
                questionResponseInProgress.transcript[
                    questionResponseInProgress.transcript.length - 1
                ];
            if (lastTurn) {
                lastTurn.respondentMessage = respondentMessage;
            }
            const thisTurn = new Turn({
                uniqueId: uniqueIdGen,
                modelMessage: modelMessage,
            });
            questionResponseInProgress.addTurn(thisTurn);
            questionResponseInProgress.lastEdited = Date.now();

            // Try to save, if fail, emit error
            const saveResult = await responseSaver(responseInProgress);
            if (saveResult instanceof Error) {
                peer.emit("error", JSON.stringify(saveResult));
            }
        }
    );
}
