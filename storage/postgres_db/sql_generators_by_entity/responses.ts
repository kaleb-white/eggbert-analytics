import { Response } from "@/core/entities/surveys/response";
import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    insertOrUpdateQuestionResponses,
    leftJoinQuestionResponses,
} from "../sql_generators_by_table/question_responses";
import {
    createJsonbResponses,
    deleteResponsesSql,
    insertOrUpdateResponses,
} from "../sql_generators_by_table/responses";
import { insertOrUpdateTurns } from "../sql_generators_by_table/turns";

export function getResponses(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `SELECT ${createJsonbResponses()}
                FROM responses
                ${leftJoinQuestionResponses(
                    "responses",
                    "responseId",
                    "uniqueId",
                    "questionResponses"
                )}
                WHERE responses.${field} IN ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
            `,

            userInput: ids,
        },
    ];
}

export function saveResponses(
    responses: Response[]
): ParameterizedStatementSets {
    if (responses.length == 0) return ["pass"];
    const insertResponsesCommand = insertOrUpdateResponses(responses);
    const insertQuestionResponsesCommand = insertOrUpdateQuestionResponses(
        responses.flatMap((r) => r.questionResponses)
    );
    const insertTurnsCommand = insertOrUpdateTurns(
        responses.flatMap((r) =>
            r.questionResponses.flatMap((qr) => qr.transcript)
        )
    );

    return [
        [insertResponsesCommand],
        [insertQuestionResponsesCommand],
        [insertTurnsCommand],
    ];
}
export function deleteResponses(
    identifiers: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    if (identifiers.length === 0) return ["pass"];
    return [deleteResponsesSql(identifiers, field)];
}
