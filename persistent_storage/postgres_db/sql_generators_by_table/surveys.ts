import { Survey } from "@/core/entities/surveys/survey";

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
