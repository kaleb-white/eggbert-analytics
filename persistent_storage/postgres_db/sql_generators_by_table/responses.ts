import { Response } from "@/core/entities/surveys/response";
import {
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";

export function insertOrUpdateResponses(
    responses: Response[]
): PossibleStatementFormat {
    const orderedFields = ["uniqueId", "timeCreated", "lastEdited"];
    const timestampFieldIndices = [1, 2];
    const allResponsesValues = getAllEntityValuesAsArray(
        responses,
        orderedFields,
        timestampFieldIndices
    );
    if (!allResponsesValues) return "pass";
    return {
        sql: `
    INSERT INTO responses (uniqueId, timeCreated, lastEdited)
        VALUES ${createParameterizedStatement(
            3,
            allResponsesValues.length,
            timestampFieldIndices
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
        'uniqueId', questionResponses.uniqueId,
        'timeCreated', questionResponses.timeCreated,
        'lastEdited', questionResponses.lastEdited,
        'questionResponses': COALESCE(${tableContainingQuestionResponses}.${questionResponsesAggName}, '[]'::jsonb),
    )) AS ${as}
    `;
}
