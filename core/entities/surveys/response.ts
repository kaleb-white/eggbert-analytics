import { questionResponse } from "./question_response";

export class Response {
    questionResponses: questionResponse[];

    constructor(questionResponses: questionResponse[] = []) {
        this.questionResponses = questionResponses;
    }
}
