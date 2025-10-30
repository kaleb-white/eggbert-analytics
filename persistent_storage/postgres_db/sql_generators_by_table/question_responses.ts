import { QuestionResponse } from "@/core/entities/surveys/question_response";
import {
    PossibleStatementFormat,
    getAllEntityValuesAsArray,
    createParameterizedStatement,
    createLeftJoin,
} from "../generation_types_and_utilities";
import { leftJoinTurns } from "./turns";
import { createJsonbQuestion } from "./questions";

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
        'summary', questionResponses.summary,
        'currentTurn', questionResponses.currentTurn,
        'timeCreated', questionResponses.timeCreated,
        'lastEdited', questionResponses.lastEdited,
        'transcript', COALESCE(${tableContainingTurnsAgg}.${turnsAggName}, '[]'::jsonb),
        'question', ${tableContainingQuestions}.${questionName}
    )) AS ${as}
    `;
}

export function leftJoinQuestionResponses(
    oneTableName: string,
    oneManyTableName: string,
    oneIdName: string,
    manyIdName: string,
    as: string
) {
    return createLeftJoin(
        oneTableName,
        "questionResponses",
        oneManyTableName,
        oneIdName,
        manyIdName,
        createJsonbQuestionResponses,
        as,
        leftJoinTurns(
            "questionResponses",
            "questionResponsesTurns",
            "questionResponseId",
            "turnId",
            "turns"
        ).concat(
            `\nJOIN ( SELECT questions.uniqueId, ${createJsonbQuestion(
                "question"
            )} FROM questions ) questions ON questions.uniqueId = questionResponses.question`
        )
    );
}
