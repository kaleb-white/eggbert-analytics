import { Survey } from "@/core/entities/surveys/survey";
import { SurveyResponse } from "@/core/entities/surveys/survey_response";

export interface SurveyDataGateway {
    saveSurvey(survey: Survey): Promise<null | Error>;
    loadSurveyWithResponses(uniqueId: string): Promise<Survey | Error>;
    loadSurveyWithoutResponses(uniqueId: string): Promise<Survey | Error>;
    loadSurveyResponses(uniqueId: string): Promise<SurveyResponse[] | Error>;
}
