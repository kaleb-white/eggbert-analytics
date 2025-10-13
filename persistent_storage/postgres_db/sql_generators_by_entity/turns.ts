import {
    ParameterizedStatementSets,
    argumentsToInStatementFromArray,
} from "../generation_types_and_utilities";
import { createJsonbTurns } from "../sql_generators_by_table/turns";

export function getTurns(ids: string[]): ParameterizedStatementSets {
    return [
        {
            sql: `
    SELECT ${createJsonbTurns()}
        FROM turns
        WHERE turns.uniqueId IN ${argumentsToInStatementFromArray(ids)}
    `,
            userInput: [],
        },
    ];
}
