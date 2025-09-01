import { Survey } from "@/entities/surveys/survey"
import { SurveyResponse } from "@/entities/surveys/survey_response"

export interface SurveyDataGateway {
    loadSurveyWithResponses(uniqueId: string): Survey | Error
    loadSurveyWithoutResponses(uniqueId: string): Survey | Error
    loadSurveyResponses(uniqueId: string): SurveyResponse[] | Error
}
