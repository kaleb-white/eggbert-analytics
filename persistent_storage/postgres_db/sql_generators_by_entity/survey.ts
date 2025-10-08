import { Survey } from "@/core/entities/surveys/survey";
import { insertOrUpdateOneManyRelation } from "../sql_generators_by_table/one-many_tables";
import { insertOrUpdateTurns } from "../sql_generators_by_table/turns";
import {
    createJsonbQuestions,
    insertOrUpdateQuestions,
} from "../sql_generators_by_table/questions";
import { insertOrUpdateQuestionResponses } from "../sql_generators_by_table/question_responses";
import { insertOrUpdateResponses } from "../sql_generators_by_table/responses";
import { insertOrUpdateSurvey } from "../sql_generators_by_table/surveys";
import { ParameterizedStatementSets } from "../generation_types_and_utilities";

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

export function saveOrUpdateSurvey(survey: Survey): ParameterizedStatementSets {
    return [
        [
            insertOrUpdateTurnsBySurvey(survey),
            insertOrUpdateQuestionsBySurvey(survey),
            insertOrUpdateQuestionResponsesBySurvey(survey),
            insertOrUpdateResponsesBySurvey(survey),
            insertOrUpdateSurvey(survey),
        ],
        insertOrUpdateOneManyRelationsOfSurvey(survey),
    ];
}

export function getSurveyWithoutResponses(
    uniqueId: string
): ParameterizedStatementSets {
    return [
        {
            sql: `
    SELECT jsonb_build_object(
        'uniqueId', surveys.uniqueId,
        'timeCreated', surveys.timeCreated,
        'lastEdited', surveys.lastEdited,
        'responses', '[]'::jsonb,
        'questions', COALESCE(sq.questionsAgg, '[]'::jsonb)
    )
        FROM surveys
        LEFT JOIN (
            SELECT surveysQuestions.surveyId, ${createJsonbQuestions()}
                FROM surveysQuestions
                JOIN questions ON surveysQuestions.questionId = questions.uniqueId
                WHERE surveysQuestions.surveyId = $1
                GROUP BY surveysQuestions.surveyId
        ) sq ON surveys.uniqueId = sq.surveyId
        WHERE surveys.uniqueId = $1;
    `,
            userInput: [uniqueId],
        },
    ];
}
