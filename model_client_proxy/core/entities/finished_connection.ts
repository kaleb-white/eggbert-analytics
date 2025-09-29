import type { questionResponse } from "../../../core/entities/surveys/question_response";

export class FinishedConnection {
    questionResponseId: string;
    newRespondentResponse: questionResponse;
    serverToken: string;

    constructor(
        questionResponseId: string,
        newRespondentResponse: questionResponse,
        serverToken: string
    ) {
        this.questionResponseId = questionResponseId;
        this.newRespondentResponse = newRespondentResponse;
        this.serverToken = serverToken;
    }
}
