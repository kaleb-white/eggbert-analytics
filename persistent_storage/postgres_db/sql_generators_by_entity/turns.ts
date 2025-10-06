import { Turn } from "@/core/entities/surveys/turn";
import {
    PossibleStatementFormat,
    argumentsToInStatementFromArray,
} from "../generation_types_and_utilities";
import { createJsonbTurns } from "../sql_generators_by_table/turns";

export function getTurns(turns: Turn[]): PossibleStatementFormat {
    return `
    SELECT ${createJsonbTurns()}
        FROM turns
        WHERE turns.uniqueId IN ${argumentsToInStatementFromArray(turns)}
    `;
}
