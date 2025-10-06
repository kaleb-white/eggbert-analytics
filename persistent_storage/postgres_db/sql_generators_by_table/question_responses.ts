import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { PossibleStatementFormat } from "../generation_types_and_utilities";

function getAllQuestionResponsesValues(questionResponses: QuestionResponse[]) {
    if (questionResponses.length == 0) return null;
    return questionResponses
        .map(
            (questionResponse) =>
                `(${questionResponse.uniqueId}, ${questionResponse.currentTurn}, ${questionResponse.timeCreated}, ${questionResponse.lastEdited}, ${questionResponse.question.uniqueId})`
        )
        .join(",");
}

export function insertOrUpdateQuestionResponses(
    questionResponses: QuestionResponse[]
): PossibleStatementFormat {
    const questionResponseValues =
        getAllQuestionResponsesValues(questionResponses);
    if (questionResponseValues == null) return "pass";
    return `
    INSERT INTO questionResponses (uniqueId, currentTurn, timeCreated, lastEdited, question)
        VALUES ${questionResponseValues}
        ON CONFLICT (uniqueId) DO SET lastEdited = EXCLUDED.lastEdited;
    `;
}

export function createJsonbQuestionResponses(
    tableContainingTurnsAgg: string = "turns",
    turnsAggName: string = "turnsAgg",
    tableContainingQuestions: string = "questions",
    questionName: string = "question",
    as: string = "questionResponsesAgg"
): PossibleStatementFormat {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', questionResponses.uniqueId,
        'summary', questionsResponses.summary,
        'currentTurn', questionsResponses.currentTurn,
        'timeCreated', questionsResponses.timeCreated,
        'lastEdited', questionsResponses.lastEdited,
        'transcript': COALESCE(${tableContainingTurnsAgg}.${turnsAggName}, '[]'::jsonb),
        'question': ${tableContainingQuestions}.${questionName}
    )) AS ${as}
    `;
}
