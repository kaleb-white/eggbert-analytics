import { Response } from "@/core/entities/surveys/response";
import {
    createLeftJoin,
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";
import { leftJoinQuestionResponses } from "./question_responses";

export function insertOrUpdateResponses(
    responses: Response[]
): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "timeCreated",
        "lastEdited",
        "respondentId",
        "surveyId",
    ];
    const allResponsesValues = getAllEntityValuesAsArray(
        responses,
        orderedFields
    );
    if (!allResponsesValues) return "pass";
    return {
        sql: `
    INSERT INTO responses (uniqueId, timeCreated, lastEdited, respondentId, surveyId)
        VALUES ${createParameterizedStatement(
            orderedFields.length,
            allResponsesValues.length
        )}
        ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;
    `,
        userInput: allResponsesValues,
    };
}

export function createJsonbResponses(
    tableContainingQuestionResponses: string = "questionResponses",
    questionResponsesAggName: string = "questionResponsesAgg",
    as: string = "responsesAgg"
) {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', responses.uniqueId,
        'timeCreated', responses.timeCreated,
        'lastEdited', responses.lastEdited,
        'respondentId', responses.respondentId,
        'questionResponses', COALESCE(${tableContainingQuestionResponses}.${questionResponsesAggName}, '[]'::jsonb),
        'surveyId', responses.surveyId
    )) AS ${as}
    `;
}

export function leftJoinResponses(
    parentTableName: string,
    parentIdNameInChildTable: string,
    as: string,
    parentIdName: string
) {
    return createLeftJoin(
        "responses",
        parentIdNameInChildTable,
        parentTableName,
        createJsonbResponses,
        as,
        parentIdName,
        true,
        leftJoinQuestionResponses(
            "responses",
            "responseId",
            "uniqueId",
            "questionResponses"
        )
    );
}

export function deleteResponsesSql(
    identifiers: string[],
    field: string = "uniqueId"
): PossibleStatementFormat {
    return {
        sql: `
    DELETE FROM responses
        WHERE responses.${field} IN ${createParameterizedStatement(
            identifiers.length,
            identifiers.length
        )}
        RETURNING responses.uniqueId;
    `,
        userInput: identifiers,
    };
}
