import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { reconstructQuestion } from "./reconstruct_question";
import { reconstructTurn } from "./reconstruct_turn";

export function reconstructQuestionResponse(
    questionResponse: string | QuestionResponse
): QuestionResponse {
    const asQuestionResponse =
        typeof questionResponse === "string"
            ? (JSON.parse(questionResponse as string) as QuestionResponse)
            : (questionResponse as QuestionResponse);

    return new QuestionResponse({
        uniqueId: asQuestionResponse.uniqueId,
        question: reconstructQuestion(asQuestionResponse.question),
        transcript: asQuestionResponse.transcript.map((t) =>
            reconstructTurn(t)
        ),
        timeCreated: asQuestionResponse.timeCreated,
        lastEdited: asQuestionResponse.lastEdited,
    });
}
