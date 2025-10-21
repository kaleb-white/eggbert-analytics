import { QuestionResponse } from "@/core/entities/surveys/question_response";
import {
    createJsonbQuestionResponses,
    insertOrUpdateQuestionResponses,
} from "../sql_generators_by_table/question_responses";
import {
    createJsonbTurns,
    insertOrUpdateTurns,
} from "../sql_generators_by_table/turns";
import {
    createJsonbQuestion,
    insertOrUpdateQuestions,
} from "../sql_generators_by_table/questions";
import {
    argumentsToInStatementFromArray,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import { insertOrUpdateOneManyRelation } from "../sql_generators_by_table/one-many_tables";

export function getQuestionResponses(
    ids: string[]
): ParameterizedStatementSets {
    return [
        {
            sql: `
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
    WHERE questionResponses.uniqueId IN ${argumentsToInStatementFromArray(ids)};
    `,
            userInput: [],
        },
    ];
}

export function saveQuestionResponses(
    questionResponses: QuestionResponse[]
): ParameterizedStatementSets {
    if (questionResponses.length == 0) return ["pass"];
    const insertQuestionResponseCommand =
        insertOrUpdateQuestionResponses(questionResponses);
    const insertQuestionsCommand = insertOrUpdateQuestions(
        questionResponses.map((qr) => qr.question)
    );
    const insertTurnsCommand = insertOrUpdateTurns(
        questionResponses.flatMap((qr) => qr.transcript)
    );

    const insertQRTs = questionResponses.flatMap((qr) =>
        insertOrUpdateOneManyRelation(
            "questionResponseId",
            "turnId",
            "questionResponsesTurns",
            qr,
            "transcript"
        )
    );
    return [
        [
            insertQuestionResponseCommand,
            insertTurnsCommand,
            insertQuestionsCommand,
        ],
        insertQRTs,
    ];
}
