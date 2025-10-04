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
        INSERT INTO questions (uniqueId, modelPrompt, maxNumberOfTurns)
            VALUES ${createParameterizedStatementWithInjectedValues(
                3,
                allQuestionValues.length
            )}
            ON CONFLICT (uniqueId) DO NOTHING;`,
        userInput: allQuestionValues,
    };
}
