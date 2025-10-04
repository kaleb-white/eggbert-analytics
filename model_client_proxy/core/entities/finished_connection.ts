import type { QuestionResponse } from "../../../core/entities/surveys/question_response";

export class FinishedConnection {
    questionResponseId: string;
    newRespondentResponse: QuestionResponse;
    serverToken: string;

    constructor(
        questionResponseId: string,
        newRespondentResponse: QuestionResponse,
        serverToken: string
    ) {
        this.questionResponseId = questionResponseId;
        this.newRespondentResponse = newRespondentResponse;
        this.serverToken = serverToken;
    }
}
