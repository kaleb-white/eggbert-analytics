import { Turn } from "@/core/entities/surveys/turn";
import {
    ParameterizedStatementSets,
    createParameterizedStatement,
} from "../generation_types_and_utilities";
import {
    createJsonbTurns,
    deleteTurnsSql,
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
        WHERE turns.${field} IN ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
    `,
            userInput: ids,
        },
    ];
}

export function saveTurns(turns: Turn[]): ParameterizedStatementSets {
    if (turns.length == 0) return ["pass"];
    return [insertOrUpdateTurns(turns)];
}

export function deleteTurns(
    identifiers: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    if (identifiers.length === 0) return ["pass"];
    return [deleteTurnsSql(identifiers, field)];
}
