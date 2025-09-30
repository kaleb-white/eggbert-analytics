import { Respondent } from "../users/respondent";
import { questionResponse } from "./question_response";

export class Response {
    questionResponses: questionResponse[];
    respondent: Respondent;

    constructor(
        questionResponses: questionResponse[] = [],
        respondent: Respondent = new Respondent("")
    ) {
        this.questionResponses = questionResponses;
        this.respondent = respondent;
    }
}
