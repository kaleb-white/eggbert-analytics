import { Survey } from "@/core/entities/surveys/survey";
import { Response } from "@entities/surveys/response";

export interface SurveyDataGateway {
    saveSurvey(survey: Survey): Promise<null | Error>;
    loadSurveyWithResponses(uniqueId: string): Promise<Survey | Error>;
    loadSurveyWithoutResponses(uniqueId: string): Promise<Survey | Error>;
    loadResponses(uniqueId: string): Promise<Response[] | Error>;
}
