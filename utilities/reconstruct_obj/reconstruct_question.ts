import { Question } from "@/core/entities/surveys/question";

export function reconstructQuestion(question: string | Question): Question {
    const asQuestion =
        typeof question === "string"
            ? (JSON.parse(question as string) as Question)
            : (question as Question);
    return new Question({
        uniqueId: asQuestion.uniqueId,
        question: asQuestion.question,
        modelPrompt: asQuestion.modelPrompt,
        maxNumberOfTurns: asQuestion.maxNumberOfTurns,
        timeCreated: asQuestion.timeCreated,
        lastEdited: asQuestion.lastEdited,
    });
}
