import { QuestionResponse } from "@/core/entities/surveys/question_response";
import {
    createJsonbQuestionResponses,
    insertOrUpdateQuestionResponses,
} from "../sql_generators_by_table/question_responses";
import {
    insertOrUpdateTurns,
    leftJoinTurns,
} from "../sql_generators_by_table/turns";
import { leftJoinQuestion } from "../sql_generators_by_table/questions";
import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";

export function getQuestionResponses(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
    SELECT ${createJsonbQuestionResponses()}
    FROM questionResponses
    ${leftJoinTurns(
        "questionResponses",
        "questionResponseId",
        "turns",
        "uniqueId"
    )}
    ${leftJoinQuestion(
        "questionResponses",
        "uniqueId",
        "question",
        "questions"
    )}
    WHERE questionResponses.${field} IN ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
    `,
            userInput: ids,
        },
    ];
}

export function saveQuestionResponses(
    questionResponses: QuestionResponse[]
): ParameterizedStatementSets {
    if (questionResponses.length == 0) return ["pass"];
    const insertQuestionResponseCommand =
        insertOrUpdateQuestionResponses(questionResponses);
    const insertTurnsCommand = insertOrUpdateTurns(
        questionResponses.flatMap((qr) => qr.transcript)
    );

    return [[insertQuestionResponseCommand], [insertTurnsCommand]];
}
