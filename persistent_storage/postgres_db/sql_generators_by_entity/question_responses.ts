import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { createJsonbQuestionResponses } from "../sql_generators_by_table/question_responses";
import { createJsonbTurns } from "../sql_generators_by_table/turns";
import { createJsonbQuestion } from "../sql_generators_by_table/questions";
import { argumentsToInStatementFromArray } from "../generation_types_and_utilities";

export function getQuestionResponses(questionResponses: QuestionResponse[]) {
    return `
    SELECT ${createJsonbQuestionResponses()}
    FROM questionResponses
    LEFT JOIN (
        SELECT questionResponseId, ${createJsonbTurns()}
        FROM questionResponsesTurns
        JOIN turns ON turns.uniqueId = questionResponsesTurns.turnsId
        GROUP BY questionResponseId
    )
    LEFT JOIN (
        SELECT questionId, ${createJsonbQuestion()}
        FROM questions
        GROUP BY questionId
    )
    WHERE questionResponses.uniqueId IN ${argumentsToInStatementFromArray(
        questionResponses
    )};
    `;
}
