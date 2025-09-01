import { Survey } from "@/core/entities/surveys/survey";
import { SurveyResponse } from "@/core/entities/surveys/survey_response";

export interface SurveyDataGateway {
  loadSurveyWithResponses(uniqueId: string): Survey | Error;
  loadSurveyWithoutResponses(uniqueId: string): Survey | Error;
  loadSurveyResponses(uniqueId: string): SurveyResponse[] | Error;
}
