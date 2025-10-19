import { Turn } from "@/core/entities/surveys/turn";

export function reconstructTurn(turn: string | Turn): Turn {
    const asTurn =
        typeof turn === "string"
            ? (JSON.parse(turn as string) as Turn)
            : (turn as Turn);
    return new Turn(
        asTurn.uniqueId,
        asTurn.modelMessage,
        asTurn.respondentMessage,
        asTurn.timeCreated,
        asTurn.lastEdited
    );
}
