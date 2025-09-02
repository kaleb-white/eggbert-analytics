import { Survey } from "@/core/entities/surveys/survey";
import { SurveyResponse } from "@/core/entities/surveys/survey_response";

export interface SurveyDataGateway {
    saveSurvey(survey: Survey): null | Error;
    loadSurveyWithResponses(uniqueId: string): Survey | Error;
    loadSurveyWithoutResponses(uniqueId: string): Survey | Error;
    loadSurveyResponses(uniqueId: string): SurveyResponse[] | Error;
}
