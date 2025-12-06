import { Response } from "@/core/entities/surveys/response";
import { reconstructQuestionResponse } from "./reconstruct_question_response";

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
        respondentId: asResponse.respondentId,
        timeCreated: asResponse.timeCreated,
        lastEdited: asResponse.lastEdited,
    });
}
