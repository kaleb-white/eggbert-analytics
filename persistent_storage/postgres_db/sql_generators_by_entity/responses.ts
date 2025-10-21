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
    insertOrUpdateResponses,
} from "../sql_generators_by_table/responses";
import { insertOrUpdateQuestions } from "../sql_generators_by_table/questions";
import { insertOrUpdateTurns } from "../sql_generators_by_table/turns";
import { insertOrUpdateOneManyRelation } from "../sql_generators_by_table/one-many_tables";

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

export function saveResponses(
    responses: Response[]
): ParameterizedStatementSets {
    if (responses.length == 0) return ["pass"];
    const insertResponsesCommand = insertOrUpdateResponses(responses);
    const insertQuestionResponsesCommand = insertOrUpdateQuestionResponses(
        responses.flatMap((r) => r.questionResponses)
    );
    // Since all responses should be responding to the same set of questions, we'll only use the responses from the first response
    const insertQuestionsCommand = insertOrUpdateQuestions(
        responses.map((r) => r.questionResponses.map((qr) => qr.question))[0]
    );
    const insertTurnsCommand = insertOrUpdateTurns(
        responses.flatMap((r) =>
            r.questionResponses.flatMap((qr) => qr.transcript)
        )
    );

    const insertRQRs = responses.flatMap((r) =>
        insertOrUpdateOneManyRelation(
            "responseId",
            "questionResponseId",
            "responsesQuestionResponses",
            r,
            "questionResponses"
        )
    );
    const insertQRTs = responses.flatMap((r) =>
        r.questionResponses.flatMap((qr) =>
            insertOrUpdateOneManyRelation(
                "questionResponseId",
                "turnId",
                "questionResponsesTurns",
                qr,
                "transcript"
            )
        )
    );

    return [
        [
            insertResponsesCommand,
            insertQuestionResponsesCommand,
            insertQuestionsCommand,
            insertTurnsCommand,
        ],
        insertRQRs.concat(insertQRTs),
    ];
}
