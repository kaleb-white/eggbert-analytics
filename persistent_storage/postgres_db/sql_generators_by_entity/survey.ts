import { Survey } from "@/core/entities/surveys/survey";
import { insertOrUpdateOneManyRelation } from "../sql_generators_by_table/one-many_tables";
import { insertOrUpdateTurns } from "../sql_generators_by_table/turns";
import { insertOrUpdateQuestions } from "../sql_generators_by_table/questions";
import { insertOrUpdateQuestionResponses } from "../sql_generators_by_table/question_responses";
import { insertOrUpdateResponses } from "../sql_generators_by_table/responses";

export function insertOrUpdateOneManyRelationsOfSurvey(survey: Survey) {
    const uncheckedResult = [
        survey.responses
            .flatMap((response) =>
                response.questionResponses.map((questionResponse) =>
                    insertOrUpdateOneManyRelation(
                        "questionResponseId",
                        "turnId",
                        "questionResponsesTurns",
                        questionResponse,
                        "transcript"
                    )
                )
            )
            .join("\n"),
        survey.responses
            .flatMap((response) =>
                insertOrUpdateOneManyRelation(
                    "responseId",
                    "questionResponseId",
                    "responsesQuestionResponses",
                    response,
                    "questionResponses"
                )
            )
            .join("\n"),
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
    return uncheckedResult.map((psf) => {
        if (psf == "") {
            return "pass";
        } else return psf;
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
