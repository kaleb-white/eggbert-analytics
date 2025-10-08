import { Survey } from "@/core/entities/surveys/survey";
import {
    jsDateToSqlTimestamp,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";

export function insertOrUpdateSurvey(survey: Survey): PossibleStatementFormat {
    return {
        sql: `INSERT INTO surveys (uniqueId, timeCreated, lastEdited)
                VALUES (
                $1,
                to_timestamp($2),
                to_timestamp($3)
            )
            ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;
            `,
        userInput: [
            survey.uniqueId,
            jsDateToSqlTimestamp(survey.timeCreated),
            jsDateToSqlTimestamp(survey.lastEdited),
        ],
    };
}

export function createJsonbSurvey(
    tableContainingResponses: string = "responses",
    responsesAggName: string = "responsesAgg",
    tableContainingQuestions: string = "questions",
    questionsAggName: string = "questionsAgg",
    as: string = "surveyAgg"
) {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', surveys.uniqueId,
        'timeCreated', surveys.timeCreated,
        'lastEdited', surveys.lastEdited,
        'questions', COALESCE(${tableContainingQuestions}.${questionsAggName}, '[]'::jsonb),
        'responses', COALESCE(${tableContainingResponses}.${responsesAggName}, '[]'::jsonb)
    )) AS ${as}
    `;
}
