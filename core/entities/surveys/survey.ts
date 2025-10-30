import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Author } from "../users/author";
import { Question } from "./question";
import { Response } from "./response";
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";

export type SurveyProps = {
    questions?: Question[];
    responses?: Response[];
    timeCreated?: number;
    lastEdited?: number;
    uniqueId?: string | CryptographyUtilities;
    author?: Author;
};

const defaultProps = {
    uniqueId: "",
    questions: [new Question()],
    responses: [new Response()],
    author: new Author(""),
    timeCreated: Date.now(),
    lastEdited: Date.now(),
};

export class Survey {
    questions: Question[];
    responses: Response[];
    timeCreated: number;
    lastEdited: number;
    uniqueId: string;
    author: Author;

    constructor(partialProps?: SurveyProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );
        this.questions = props.questions
            ? props.questions
            : defaultProps.questions;
        this.responses = props.responses
            ? props.responses
            : defaultProps.responses;
        this.author = props.author ? props.author : defaultProps.author;
        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastEdited = props.lastEdited
            ? props.lastEdited
            : defaultProps.lastEdited;
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
