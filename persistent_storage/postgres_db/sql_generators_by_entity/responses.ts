import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import { leftJoinQuestionResponses } from "../sql_generators_by_table/question_responses";
import { createJsonbResponses } from "../sql_generators_by_table/responses";

export function getResponses(ids: string[]): ParameterizedStatementSets {
    return [
        {
            sql: `SELECT ${createJsonbResponses()}
                FROM responses
                ${leftJoinQuestionResponses(
                    "responses",
                    "responsesQuestionResponses",
                    "responseId",
                    "questionResponseId",
                    "questionResponses"
                )}
                WHERE responses.uniqueId IN ${createParameterizedStatement(
                    ids.length,
                    ids.length
                )};

            `,

            userInput: ids,
        },
    ];
}
