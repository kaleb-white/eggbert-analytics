import { Turn } from "@/core/entities/surveys/turn";

export function reconstructTurn(turn: string | Turn): Turn {
    const asTurn =
        typeof turn === "string"
            ? (JSON.parse(turn as string) as Turn)
            : (turn as Turn);
    return new Turn({
        uniqueId: asTurn.uniqueId,
        modelMessage: asTurn.modelMessage,
        respondentMessage: asTurn.respondentMessage,
        timeCreated: asTurn.timeCreated,
        lastEdited: asTurn.lastEdited,
        questionResponseId: asTurn.questionResponseId,
    });
}
