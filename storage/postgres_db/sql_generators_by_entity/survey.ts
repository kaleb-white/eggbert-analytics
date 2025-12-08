import { Survey } from "@/core/entities/surveys/survey";
import { insertOrUpdateTurns } from "../sql_generators_by_table/turns";
import {
    insertOrUpdateQuestions,
    leftJoinQuestions,
} from "../sql_generators_by_table/questions";
import { insertOrUpdateQuestionResponses } from "../sql_generators_by_table/question_responses";
import {
    insertOrUpdateResponses,
    leftJoinResponses,
} from "../sql_generators_by_table/responses";
import {
    createJsonbSurvey,
    deleteSurveysSql,
    insertOrUpdateSurvey,
} from "../sql_generators_by_table/surveys";
import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    insertOrUpdateUser,
    leftJoinUsers,
} from "../sql_generators_by_table/user";

export function insertOrUpdateTurnsBySurvey(survey: Survey) {
    return insertOrUpdateTurns(
        survey.responses.flatMap((response) =>
            response.questionResponses.flatMap((qr) => qr.transcript)
        )
    );
}

export function insertOrUpdateQuestionsBySurvey(survey: Survey) {
    return insertOrUpdateQuestions(survey.questions);
}

export function insertOrUpdateQuestionResponsesBySurvey(survey: Survey) {
    return insertOrUpdateQuestionResponses(
        survey.responses.flatMap((response) => response.questionResponses)
    );
}

export function insertOrUpdateResponsesBySurvey(survey: Survey) {
    return insertOrUpdateResponses(survey.responses);
}

export function saveSurveys(surveys: Survey[]): ParameterizedStatementSets {
    return [
        surveys.map((survey) => {
            return insertOrUpdateUser(survey.author);
        }),
        surveys.map((survey) => {
            return insertOrUpdateSurvey(survey);
        }),
        surveys.flatMap((survey) => {
            return [
                insertOrUpdateQuestionsBySurvey(survey),
                insertOrUpdateResponsesBySurvey(survey),
            ];
        }),
        surveys.map((survey) => {
            return insertOrUpdateQuestionResponsesBySurvey(survey);
        }),
        surveys.map((survey) => {
            return insertOrUpdateTurnsBySurvey(survey);
        }),
    ];
}

export function getSurveys(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
    SELECT jsonb_agg(jsonb_build_object(
        'uniqueId', surveys.uniqueId,
        'timeCreated', surveys.timeCreated,
        'lastEdited', surveys.lastEdited,
        'responses', COALESCE(responses.responsesAgg, '[]'::jsonb),
        'questions', COALESCE(sq.questionsAgg, '[]'::jsonb),
        'author', COALESCE(u.user, '{}'::jsonb)
        )) AS surveysAgg
        FROM surveys
        ${leftJoinResponses("surveys", "surveyId", "responses", "uniqueId")}
        ${leftJoinQuestions("surveys", "surveyId", "sq", "uniqueId")}
        ${leftJoinUsers("surveys", "authorId", "u")}
        WHERE surveys.${field} IN ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
    `,
            userInput: ids,
        },
    ];
}

export function getSurveyWithoutResponses(
    uniqueId: string,
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
        SELECT ${createJsonbSurvey(true)}
        FROM surveys
        ${leftJoinQuestions("surveys", "surveyId", "questions", "uniqueId")}
        WHERE surveys.${field} = $1;
        `,
            userInput: [uniqueId],
        },
    ];
}

export function deleteSurveys(
    identifiers: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    if (identifiers.length === 0) return ["pass"];
    return [deleteSurveysSql(identifiers, field)];
}
