import { Response } from "@/core/entities/surveys/response";
import { reconstructQuestionResponse } from "./reconstruct_question_response";
import { reconstructRespondent } from "./reconstruct_respondent";

export function reconstructResponse(response: string | Response): Response {
    const asResponse =
        typeof response === "string"
            ? (JSON.parse(response as string) as Response)
            : (response as Response);

    return new Response({
        uniqueId: asResponse.uniqueId,
        questionResponses: asResponse.questionResponses.map((qr) =>
            reconstructQuestionResponse(qr)
        ),
        respondent: reconstructRespondent(asResponse.respondent),
        timeCreated: asResponse.timeCreated,
        lastEdited: asResponse.lastEdited,
    });
}
