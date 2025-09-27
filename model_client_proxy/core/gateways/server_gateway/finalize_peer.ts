import type { Socket } from "socket.io";
import type { DialogueContext } from "../../entities/response_context";
import type { SurveyResponse } from "../../../../core/entities/surveys/survey_response";
import { FinishedConnection } from "../../entities/finished_connection";

export function finalizePeer(
    peer: Socket,
    context: DialogueContext,
    surveyResponseFinalized: SurveyResponse
) {
    peer.on("respondent finished", () => {
        if (!process.env.EXPECTED_SERVER_TOKEN)
            throw new Error(
                "Cannot finalize peer without a server token to send to the server!"
            );

        const sendToServer: FinishedConnection = new FinishedConnection(
            context.surveyResponseId,
            surveyResponseFinalized,
            process.env.EXPECTED_SERVER_TOKEN
        );
    });
}
