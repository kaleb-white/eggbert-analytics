import { Survey } from "@/core/entities/surveys/survey";
import { questionResponse } from "@/core/entities/surveys/question_response";

export interface SurveyDataGateway {
    saveSurvey(survey: Survey): Promise<null | Error>;
    loadSurveyWithResponses(uniqueId: string): Promise<Survey | Error>;
    loadSurveyWithoutResponses(uniqueId: string): Promise<Survey | Error>;
    loadquestionResponses(
        uniqueId: string
    ): Promise<questionResponse[] | Error>;
}
