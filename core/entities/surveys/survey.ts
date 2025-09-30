import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Question } from "./question";
import { Response } from "./response";
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";

export class Survey {
    questions: Question[];
    responses: Response[];
    createdAt: number;
    lastEdited: number;
    uniqueid: string;

    constructor(
        questions: Question[],
        uniqueId: string | CryptographyUtilities,
        responses: Response[],
        createdAt: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.questions = questions;
        this.uniqueid = assignOrCreateUniqueId(uniqueId);
        this.responses = responses;
        this.createdAt = createdAt;
        this.lastEdited = lastEdited;
    }

    addResponse(newResponse: Response, changeTimeLastEdited = true) {
        this.responses = this.responses.concat(newResponse);
        if (changeTimeLastEdited) this.lastEdited = Date.now();
    }

    addQuestion(newQuestion: Question, changeTimeLastEdited = true) {
        this.questions = this.questions.concat(newQuestion);
        if (changeTimeLastEdited) this.lastEdited = Date.now();
    }

    combine(withThisSurvey: Survey): Error | null {
        if (
            !(this.questions.length == withThisSurvey.questions.length) ||
            !this.questions.every((q) => withThisSurvey.questions.includes(q))
        ) {
            return new Error("Question arrays did not match");
        }

        this.responses = this.responses.concat(withThisSurvey.responses);
        this.lastEdited = Date.now();

        return null;
    }
}
