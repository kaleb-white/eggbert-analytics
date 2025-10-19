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

    console.log(asQuestionResponse);
    console.log(asQuestionResponse["question"]);
    return new QuestionResponse(
        asQuestionResponse.uniqueId,
        reconstructQuestion(asQuestionResponse.question),
        asQuestionResponse.transcript.map((t) => reconstructTurn(t)),
        asQuestionResponse.timeCreated,
        asQuestionResponse.lastEdited
    );
}
