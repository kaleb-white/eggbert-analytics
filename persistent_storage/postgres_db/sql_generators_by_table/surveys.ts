import { Survey } from "@/core/entities/surveys/survey";
import { PossibleStatementFormat } from "../generation_types_and_utilities";

export function insertOrUpdateSurvey(survey: Survey) {
    return `INSERT INTO surveys (uniqueId, timeCreated, lastEdited)
                VALUES (
                ${survey.uniqueId},
                ${survey.timeCreated},
                ${survey.lastEdited}
            )
            ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;
            `;
}

export function createJsonbSurvey(
    tableContainingResponses: string = "responses",
    responsesAggName: string = "responsesAgg",
    tableContainingQuestions: string = "questions",
    questionsAggName: string = "questionsAgg",
    as: string = "surveyAgg"
): PossibleStatementFormat {
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
