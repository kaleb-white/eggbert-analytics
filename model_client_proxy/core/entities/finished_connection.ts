import type { Response } from "../../../core/entities/surveys/response";

export class FinishedConnection {
    responseId: string;
    newRespondentResponse: Response;
    serverToken: string;

    constructor(
        responseId: string,
        newRespondentResponse: Response,
        serverToken: string
    ) {
        this.responseId = responseId;
        this.newRespondentResponse = newRespondentResponse;
        this.serverToken = serverToken;
    }
}
