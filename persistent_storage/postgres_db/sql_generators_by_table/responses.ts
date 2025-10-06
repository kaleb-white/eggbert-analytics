import { Response } from "@/core/entities/surveys/response";
import { PossibleStatementFormat } from "../generation_types_and_utilities";

function getAllResponsesValues(responses: Response[]) {
    if (responses.length == 0) return null;
    return responses
        .map(
            (response) =>
                `(${response.uniqueId}, ${response.timeCreated}, ${response.lastEdited})`
        )
        .join(",");
}

export function insertOrUpdateResponses(responses: Response[]) {
    const responsesValues = getAllResponsesValues(responses);
    if (!responsesValues) return "pass";
    return `
    INSERT INTO responses (uniqueId, timeCreated, lastEdited)
        VALUES ${responsesValues}
        ON CONFLICT (uniqueId) DO SET lastEdited = EXCLUDED.lastEdited;
    `;
}

export function createJsonbResponses(
    tableContainingQuestionResponses: string = "questionResponses",
    questionResponsesAggName: string = "questionResponsesAgg",
    as: string = "responsesAgg"
): PossibleStatementFormat {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', questionResponses.uniqueId,
        'timeCreated', questionResponses.timeCreated,
        'lastEdited', questionResponses.lastEdited,
        'questionResponses': COALESCE(${tableContainingQuestionResponses}.${questionResponsesAggName}, '[]'::jsonb),
    )) AS ${as}
    `;
}
