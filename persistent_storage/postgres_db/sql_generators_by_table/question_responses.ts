import { QuestionResponse } from "@/core/entities/surveys/question_response";
import {
    PossibleStatementFormat,
    getAllEntityValuesAsArray,
    createParameterizedStatement,
} from "../generation_types_and_utilities";

export function insertOrUpdateQuestionResponses(
    questionResponses: QuestionResponse[]
): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "currentTurn",
        "timeCreated",
        "lastEdited",
        ["question", "uniqueId"],
    ];
    const timestampFieldIndices = [2, 3];
    const allQuestionResponseValues = getAllEntityValuesAsArray(
        questionResponses,
        orderedFields,
        timestampFieldIndices
    );
    if (allQuestionResponseValues == null) return "pass";
    return {
        sql: `
    INSERT INTO questionResponses (uniqueId, currentTurn, timeCreated, lastEdited, question)
        VALUES ${createParameterizedStatement(
            5,
            allQuestionResponseValues.length,
            timestampFieldIndices
        )}
        ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;
    `,
        userInput: allQuestionResponseValues,
    };
}

export function createJsonbQuestionResponses(
    tableContainingTurnsAgg: string = "turns",
    turnsAggName: string = "turnsAgg",
    tableContainingQuestions: string = "questions",
    questionName: string = "question",
    as: string = "questionResponsesAgg"
) {
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
