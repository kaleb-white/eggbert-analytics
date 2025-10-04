import { Response } from "@/core/entities/surveys/response";

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
