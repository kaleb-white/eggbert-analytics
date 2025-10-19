import { Question } from "@/core/entities/surveys/question";

export function reconstructQuestion(question: string | Question): Question {
    const asQuestion =
        typeof question === "string"
            ? (JSON.parse(question as string) as Question)
            : (question as Question);
    return new Question(
        asQuestion.uniqueId,
        asQuestion.modelPrompt,
        asQuestion.maxNumberOfTurns,
        asQuestion.timeCreated,
        asQuestion.lastEdited
    );
}
