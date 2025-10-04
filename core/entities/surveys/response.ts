import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Respondent } from "../users/respondent";
import { QuestionResponse } from "./question_response";

export class Response {
    uniqueId: string;
    questionResponses: QuestionResponse[];
    respondent: Respondent;
    timeCreated: number;
    lastEdited: number;

    constructor(
        uniqueId: string | CryptographyUtilities,
        questionResponses: QuestionResponse[] = [],
        respondent: Respondent = new Respondent(""),
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.questionResponses = questionResponses;
        this.respondent = respondent;
        this.timeCreated = timeCreated;
        this.lastEdited = lastEdited;
    }
}
