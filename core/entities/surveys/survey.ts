import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Author } from "../users/author";
import { Question } from "./question";
import { Response } from "./response";
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";

export class Survey {
    questions: Question[];
    responses: Response[];
    timeCreated: number;
    lastEdited: number;
    uniqueId: string;
    author: Author;

    constructor(
        uniqueId: string | CryptographyUtilities = "",
        questions: Question[] = [new Question()],
        responses: Response[] = [new Response()],
        author: Author = new Author(""),
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.questions = questions;
        this.responses = responses;
        this.author = author;
        this.timeCreated = timeCreated;
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
