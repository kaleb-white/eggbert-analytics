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
    const orderedFields = ["uniqueId", "timeCreated", "lastEdited"];
    const allResponsesValues = getAllEntityValuesAsArray(
        responses,
        orderedFields
    );
    if (!allResponsesValues) return "pass";
    return {
        sql: `
    INSERT INTO responses (uniqueId, timeCreated, lastEdited)
        VALUES ${createParameterizedStatement(3, allResponsesValues.length)}
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
        'respondent', '{}'::jsonb,
        'questionResponses', COALESCE(${tableContainingQuestionResponses}.${questionResponsesAggName}, '[]'::jsonb)
    )) AS ${as}
    `;
}

export function leftJoinResponses(
    oneTableName: string,
    oneManyTableName: string,
    oneIdName: string,
    manyIdName: string,
    as: string
) {
    return createLeftJoin(
        oneTableName,
        "responses",
        oneManyTableName,
        oneIdName,
        manyIdName,
        createJsonbResponses,
        as,
        leftJoinQuestionResponses(
            "responses",
            "responsesQuestionResponses",
            "responseId",
            "questionResponseId",
            "questionResponses"
        )
    );
}
