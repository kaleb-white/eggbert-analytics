import {
    createParameterizedStatementWithInjectedValues,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";
import { Question } from "@/core/entities/surveys/question";

function getAllQuestionsValuesAsArray(questions: Question[]) {
    if (questions.length == 0) return null;
    return questions.flatMap((question) => [
        question.uniqueId,
        question.modelPrompt,
        String(question.maxNumberOfTurns),
        String(question.timeCreated),
        String(question.lastEdited),
    ]);
}

export function insertOrUpdateQuestions(
    questions: Question[]
): PossibleStatementFormat {
    const allQuestionValues = getAllQuestionsValuesAsArray(questions);
    if (!allQuestionValues) return "pass";
    return {
        isParameterizedStatement: true,
        sql: `
        INSERT INTO questions (uniqueId, modelPrompt, maxNumberOfTurns, timeCreated, lastEdited)
            VALUES ${createParameterizedStatementWithInjectedValues(
                5,
                allQuestionValues.length
            )}
            ON CONFLICT (uniqueId) DO NOTHING;`,
        userInput: allQuestionValues,
    };
}
