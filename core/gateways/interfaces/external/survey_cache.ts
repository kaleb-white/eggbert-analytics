import { Survey } from "@/core/entities/surveys/survey";

export interface SurveyCache {
    saveSurvey(survey: Survey): Promise<null | Error>;
    loadSurveyFromCache(uniqueId: string): Promise<Survey | Error>;
}
