import { Question } from "@/core/entities/surveys/question";
import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    createJsonbQuestions,
    insertOrUpdateQuestions,
} from "../sql_generators_by_table/questions";

export function getQuestions(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbQuestions()}
                FROM questions
                WHERE questions.${field} in ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
            `,
            userInput: ids,
        },
    ];
}

export function saveQuestions(
    questions: Question[]
): ParameterizedStatementSets {
    if (questions.length == 0) return ["pass"];
    return [insertOrUpdateQuestions(questions)];
}
