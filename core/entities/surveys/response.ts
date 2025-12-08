import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../../controllers/crypto/interfaces/crypto_utility_creator";
import { QuestionResponse } from "./question_response";

export type ResponseProps = {
    uniqueId?: string | CryptographyUtilities;
    questionResponses?: QuestionResponse[];
    respondentId?: string;
    timeCreated?: number;
    lastEdited?: number;
    surveyId?: string;
};

const defaultProps = {
    uniqueId: "",
    questionResponses: [],
    respondentId: "",
    timeCreated: Date.now(),
    lastEdited: Date.now(),
    surveyId: "",
};

export class Response {
    uniqueId: string;
    questionResponses: QuestionResponse[];
    respondentId: string;
    timeCreated: number;
    lastEdited: number;
    surveyId: string;

    constructor(partialProps?: ResponseProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );
        this.questionResponses = props.questionResponses
            ? props.questionResponses
            : defaultProps.questionResponses;
        this.respondentId = props.respondentId
            ? props.respondentId
            : defaultProps.respondentId;
        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastEdited = props.lastEdited
            ? props.lastEdited
            : defaultProps.lastEdited;
        this.surveyId = props.surveyId ? props.surveyId : defaultProps.surveyId;
    }
}
