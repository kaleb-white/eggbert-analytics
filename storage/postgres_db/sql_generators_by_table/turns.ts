import { Turn } from "@/core/entities/surveys/turn";
import {
    createLeftJoin,
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";

export function insertOrUpdateTurns(turns: Turn[]): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "modelMessage",
        "respondentMessage",
        "timeCreated",
        "lastEdited",
        "questionResponseId",
    ];
    const allTurnValues = getAllEntityValuesAsArray(turns, orderedFields);
    if (!allTurnValues) return "pass";

    return {
        sql: `
        INSERT INTO turns (uniqueId, modelMessage, respondentMessage, timeCreated, lastEdited, questionResponseId)
            VALUES ${createParameterizedStatement(
                orderedFields.length,
                allTurnValues.length
            )}
            ON CONFLICT (uniqueId) DO UPDATE SET modelMessage = EXCLUDED.modelMessage, respondentMessage = EXCLUDED.respondentMessage;
        `,
        userInput: allTurnValues,
    };
}

export function createJsonbTurns(as: string = "turnsAgg") {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', turns.uniqueId,
        'modelMessage', turns.modelMessage,
        'respondentMessage', turns.respondentMessage,
        'timeCreated', turns.timeCreated,
        'lastEdited', turns.lastEdited,
        'questionResponseId', turns.questionResponseId
    )) AS ${as}
    `;
}

export function leftJoinTurns(
    parentTableName: string,
    parentIdNameInChildTable: string,
    as: string,
    parentIdName: string
) {
    return createLeftJoin(
        "turns",
        parentIdNameInChildTable,
        parentTableName,
        createJsonbTurns,
        as,
        parentIdName,
        true
    );
}

export function deleteTurnsSql(
    identifiers: string[],
    field: string = "uniqueId"
): PossibleStatementFormat {
    return {
        sql: `
    DELETE FROM turns
        WHERE turns.${field} IN ${createParameterizedStatement(
            identifiers.length,
            identifiers.length
        )}
        RETURNING turns.uniqueId;
    `,
        userInput: identifiers,
    };
}
