import { Survey } from "@/core/entities/surveys/survey";
import { insertOrUpdateOneManyRelation } from "../sql_generators_by_table/one-many_tables";
import { insertOrUpdateTurns } from "../sql_generators_by_table/turns";
import {
    createJsonbQuestions,
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
    insertOrUpdateSurvey,
} from "../sql_generators_by_table/surveys";
import {
    argumentsToInStatementFromArray,
    createLeftJoin,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    insertOrUpdateUser,
    leftJoinUsers,
} from "../sql_generators_by_table/user";

export function insertOrUpdateOneManyRelationsOfSurvey(survey: Survey) {
    const uncheckedResult = [
        survey.responses.flatMap((response) =>
            response.questionResponses.map((questionResponse) =>
                insertOrUpdateOneManyRelation(
                    "questionResponseId",
                    "turnId",
                    "questionResponsesTurns",
                    questionResponse,
                    "transcript"
                )
            )
        ),
        survey.responses.flatMap((response) =>
            insertOrUpdateOneManyRelation(
                "responseId",
                "questionResponseId",
                "responsesQuestionResponses",
                response,
                "questionResponses"
            )
        ),
        insertOrUpdateOneManyRelation(
            "surveyId",
            "questionId",
            "surveysQuestions",
            survey,
            "questions"
        ),
        insertOrUpdateOneManyRelation(
            "surveyId",
            "responseId",
            "surveysResponses",
            survey,
            "responses"
        ),
    ];
    return uncheckedResult.flatMap((possibleStatement) => {
        if (possibleStatement) {
            return possibleStatement;
        } else {
            return "pass";
        }
    });
}

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
        surveys.flatMap((survey) => {
            return [
                insertOrUpdateQuestionsBySurvey(survey),
                insertOrUpdateUser(survey.author),
            ];
        }),
        surveys.flatMap((survey) => {
            return [
                insertOrUpdateTurnsBySurvey(survey),
                insertOrUpdateQuestionResponsesBySurvey(survey),
                insertOrUpdateResponsesBySurvey(survey),
                insertOrUpdateSurvey(survey),
            ];
        }),
        surveys.flatMap((survey) =>
            insertOrUpdateOneManyRelationsOfSurvey(survey)
        ),
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
        ${leftJoinResponses(
            "surveys",
            "surveysResponses",
            "surveyId",
            "responseId",
            "responses"
        )}
        ${createLeftJoin(
            "surveys",
            "questions",
            "surveysQuestions",
            "surveyId",
            "questionId",
            createJsonbQuestions,
            "sq"
        )}
        ${leftJoinUsers("surveys", "authorId", "u")}
        WHERE surveys.${field} IN ${argumentsToInStatementFromArray(ids)};
    `,
            userInput: [],
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
        ${leftJoinQuestions("surveys", "surveysQuestions", "surveyId")}
        WHERE surveys.${field} = $1;
        `,
            userInput: [uniqueId],
        },
    ];
}
