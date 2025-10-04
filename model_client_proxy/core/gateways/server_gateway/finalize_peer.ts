import type { Socket } from "socket.io";
import type { DialogueContext } from "../../entities/dialogue_context";
import type { QuestionResponse } from "../../../../core/entities/surveys/question_response";
import { FinishedConnection } from "../../entities/finished_connection";

export function finalizePeer(
    peer: Socket,
    context: DialogueContext,
    questionResponseFinalized: QuestionResponse,
    removeFromAllowedAddressesAndIds: () => void
) {
    peer.on("respondent finished", () => {
        if (!process.env.EXPECTED_SERVER_TOKEN)
            throw new Error(
                "Cannot finalize peer without a server token to send to the server!"
            );

        const sendToServer: FinishedConnection = new FinishedConnection(
            context.questionResponseId,
            questionResponseFinalized,
            process.env.EXPECTED_SERVER_TOKEN
        );

        removeFromAllowedAddressesAndIds();
    });
}
