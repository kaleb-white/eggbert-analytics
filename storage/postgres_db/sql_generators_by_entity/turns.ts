import { Turn } from "@/core/entities/surveys/turn";
import {
    ParameterizedStatementSets,
    argumentsToInStatementFromArray,
} from "../generation_types_and_utilities";
import {
    createJsonbTurns,
    insertOrUpdateTurns,
} from "../sql_generators_by_table/turns";

export function getTurns(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
    SELECT ${createJsonbTurns()}
        FROM turns
        WHERE turns.${field} IN ${argumentsToInStatementFromArray(ids)};
    `,
            userInput: [],
        },
    ];
}

export function saveTurns(turns: Turn[]): ParameterizedStatementSets {
    if (turns.length == 0) return ["pass"];
    return [insertOrUpdateTurns(turns)];
}
