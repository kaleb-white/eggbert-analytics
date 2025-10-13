import { Survey } from "@/core/entities/surveys/survey";

export interface SurveyDatabase {
    saveSurvey(survey: Survey): Promise<null | Error>;
    loadSurveyWithResponsesFromDb(uniqueId: string): Promise<Survey | Error>;
    loadSurveyWithoutResponsesFromDb(uniqueId: string): Promise<Survey | Error>;
}
