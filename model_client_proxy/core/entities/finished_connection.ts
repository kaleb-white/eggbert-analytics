import type { SurveyResponse } from "../../../core/entities/surveys/survey_response";

export class FinishedConnection {
    surveyResponseId: string;
    newRespondentResponse: SurveyResponse;
    serverToken: string;

    constructor(
        surveyResponseId: string,
        newRespondentResponse: SurveyResponse,
        serverToken: string
    ) {
        this.surveyResponseId = surveyResponseId;
        this.newRespondentResponse = newRespondentResponse;
        this.serverToken = serverToken;
    }
}
