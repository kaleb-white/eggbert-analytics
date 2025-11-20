import {
    createLeftJoin,
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";
import { Question } from "@/core/entities/surveys/question";

export function insertOrUpdateQuestions(
    questions: Question[]
): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "question",
        "modelPrompt",
        "maxNumberOfTurns",
        "timeCreated",
        "lastEdited",
        "surveyId",
    ];
    const allQuestionValues = getAllEntityValuesAsArray(
        questions,
        orderedFields
    );
    if (!allQuestionValues) return "pass";
    return {
        sql: `
        INSERT INTO questions (uniqueId, question, modelPrompt, maxNumberOfTurns, timeCreated, lastEdited, surveyId)
            VALUES ${createParameterizedStatement(
                orderedFields.length,
                allQuestionValues.length
            )}
            ON CONFLICT (uniqueId) DO NOTHING;`,
        userInput: allQuestionValues,
    };
}

export function createJsonbQuestions(as: string = "questionsAgg") {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', questions.uniqueId,
        'question', questions.question,
        'modelPrompt', questions.modelPrompt,
        'maxNumberOfTurns', questions.maxNumberOfTurns,
        'timeCreated', questions.timeCreated,
        'lastEdited', questions.lastEdited,
        'surveyId', questions.surveyId
    )) AS ${as}`;
}

export function createJsonbQuestion(as: string = "question") {
    return `
    jsonb_build_object(
        'uniqueId', questions.uniqueId,
        'question', questions.question,
        'modelPrompt', questions.modelPrompt,
        'maxNumberOfTurns', questions.maxNumberOfTurns,
        'timeCreated', questions.timeCreated,
        'lastEdited', questions.lastEdited,
        'surveyId', questions.surveyId
    ) AS ${as}
    `;
}

export function leftJoinQuestions(
    parentTableName: string,
    parentIdNameInChildTable: string,
    as: string,
    parentIdName: string
) {
    return createLeftJoin(
        "questions",
        parentIdNameInChildTable,
        parentTableName,
        createJsonbQuestions,
        as,
        parentIdName,
        true
    );
}

export function leftJoinQuestion(
    parentTableName: string,
    parentIdNameInChildTable: string,
    parentIdName: string,
    as: string
) {
    return createLeftJoin(
        "questions",
        parentIdNameInChildTable,
        parentTableName,
        createJsonbQuestion,
        as,
        parentIdName
    );
}
