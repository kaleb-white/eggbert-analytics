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
    ];
    const allTurnValues = getAllEntityValuesAsArray(turns, orderedFields);
    if (!allTurnValues) return "pass";

    return {
        sql: `
        INSERT INTO turns (uniqueId, modelMessage, respondentMessage, timeCreated, lastEdited)
            VALUES ${createParameterizedStatement(5, allTurnValues.length)}
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
        'lastEdited', turns.lastEdited
    )) AS ${as}
    `;
}

export function leftJoinTurns(
    oneTableName: string,
    oneManyTableName: string,
    oneIdName: string,
    manyIdName: string,
    as: string = "turnsAgg"
) {
    return createLeftJoin(
        oneTableName,
        "turns",
        oneManyTableName,
        oneIdName,
        manyIdName,
        createJsonbTurns,
        as
    );
}
