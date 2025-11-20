import { QuestionResponse } from "@/core/entities/surveys/question_response";
import {
    PossibleStatementFormat,
    getAllEntityValuesAsArray,
    createParameterizedStatement,
    createLeftJoin,
} from "../generation_types_and_utilities";
import { leftJoinTurns } from "./turns";
import { leftJoinQuestion } from "./questions";

export function insertOrUpdateQuestionResponses(
    questionResponses: QuestionResponse[]
): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "currentTurn",
        "timeCreated",
        "lastEdited",
        ["question", "uniqueId"],
        "responseId",
    ];
    const allQuestionResponseValues = getAllEntityValuesAsArray(
        questionResponses,
        orderedFields
    );
    if (allQuestionResponseValues == null) return "pass";
    return {
        sql: `
    INSERT INTO questionResponses (uniqueId, currentTurn, timeCreated, lastEdited, question, responseId)
        VALUES ${createParameterizedStatement(
            orderedFields.length,
            allQuestionResponseValues.length
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
        'summary', questionResponses.summary,
        'currentTurn', questionResponses.currentTurn,
        'timeCreated', questionResponses.timeCreated,
        'lastEdited', questionResponses.lastEdited,
        'transcript', COALESCE(${tableContainingTurnsAgg}.${turnsAggName}, '[]'::jsonb),
        'question', ${tableContainingQuestions}.${questionName},
        'responseId', questionResponses.responseId
    )) AS ${as}
    `;
}

export function leftJoinQuestionResponses(
    parentTableName: string,
    parentIdNameInChildTable: string,
    parentIdName: string,
    as: string
) {
    return createLeftJoin(
        "questionResponses",
        parentIdNameInChildTable,
        parentTableName,
        createJsonbQuestionResponses,
        as,
        parentIdName,
        true,
        ""
            .concat(
                leftJoinTurns(
                    "questionResponses",
                    "questionResponseId",
                    "turns",
                    "uniqueId"
                )
            )
            .concat(
                leftJoinQuestion(
                    "questionResponses",
                    "uniqueId",
                    "question",
                    "questions"
                )
            )
    );
}
