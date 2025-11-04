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
    ];
    const timestampFieldIndices = [4, 5];
    const allQuestionValues = getAllEntityValuesAsArray(
        questions,
        orderedFields,
        timestampFieldIndices
    );
    if (!allQuestionValues) return "pass";
    return {
        sql: `
        INSERT INTO questions (uniqueId, question, modelPrompt, maxNumberOfTurns, timeCreated, lastEdited)
            VALUES ${createParameterizedStatement(
                6,
                allQuestionValues.length,
                timestampFieldIndices
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
        'lastEdited', questions.lastEdited
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
        'lastEdited', questions.lastEdited
    ) AS ${as}
    `;
}

export function leftJoinQuestions(
    oneTableName: string,
    oneManyTableName: string,
    oneIdName: string,
    as: string = "questions"
) {
    return createLeftJoin(
        oneTableName,
        "questions",
        oneManyTableName,
        oneIdName,
        "questionId",
        createJsonbQuestions,
        as
    );
}
