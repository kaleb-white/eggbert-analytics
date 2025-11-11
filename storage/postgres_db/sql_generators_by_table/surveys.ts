import { Survey } from "@/core/entities/surveys/survey";
import { PossibleStatementFormat } from "../generation_types_and_utilities";

export function insertOrUpdateSurvey(survey: Survey): PossibleStatementFormat {
    return {
        sql: `INSERT INTO surveys (uniqueId, timeCreated, lastEdited, authorId)
                VALUES (
                $1,
                to_timestamp($2),
                to_timestamp($3),
                $4
            )
            ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;
            `,
        userInput: [
            survey.uniqueId,
            String(survey.timeCreated),
            String(survey.lastEdited),
            survey.author.uniqueId,
        ],
    };
}

export function createJsonbSurvey(
    excludeResponses: boolean = false,
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
        'responses', ${
            excludeResponses
                ? "'[]'::jsonb"
                : `COALESCE(${tableContainingResponses}.${responsesAggName}, '[]'::jsonb)`
        }
    )) AS ${as}
    `;
}
