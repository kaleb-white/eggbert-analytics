import { Turn } from "@/core/entities/surveys/turn";
import {
    createParameterizedStatementWithInjectedValues,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";

// NOTE: modelAnswer and respondentInput includes user input!

function getAllTurnsValuesAsArray(turns: Turn[]) {
    if (turns.length == 0) return null;
    return turns.flatMap((turn) => [
        turn.uniqueId,
        turn.modelAnswer,
        turn.respondentInput,
        String(turn.timeCreated),
        String(turn.lastEdited),
    ]);
}

export function insertOrUpdateTurns(turns: Turn[]): PossibleStatementFormat {
    const allTurnFieldsArray = getAllTurnsValuesAsArray(turns);
    if (!allTurnFieldsArray) return "pass";
    return {
        isParameterizedStatement: true,
        sql: `
        INSERT INTO turns (uniqueId, modelAnswer, respondentInput, timeCreated, lastEdited)
            VALUES ${createParameterizedStatementWithInjectedValues(
                5,
                allTurnFieldsArray.length
            )}
            ON CONFLICT (uniqueId) DO SET modelAnswer = EXCLUDED.modelAnswer, respondentInput = EXCLUDED.respondentInput;
        `,
        userInput: allTurnFieldsArray,
    };
}
