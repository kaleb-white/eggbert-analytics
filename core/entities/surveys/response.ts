import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../../controllers/crypto/interfaces/crypto_utility_creator";
import { QuestionResponse } from "./question_response";
import { Respondent } from "../users/respondent";

export type ResponseProps = {
    uniqueId?: string | CryptographyUtilities;
    questionResponses?: QuestionResponse[];
    respondent?: Respondent;
    timeCreated?: number;
    lastEdited?: number;
    surveyId?: string;
};

const defaultProps = {
    uniqueId: "",
    questionResponses: [],
    respondent: new Respondent(),
    timeCreated: Date.now(),
    lastEdited: Date.now(),
    surveyId: "",
};

export class Response {
    uniqueId: string;
    questionResponses: QuestionResponse[];
    respondent: Respondent;
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
        this.respondent = props.respondent
            ? props.respondent
            : defaultProps.respondent;
        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastEdited = props.lastEdited
            ? props.lastEdited
            : defaultProps.lastEdited;
        this.surveyId = props.surveyId ? props.surveyId : defaultProps.surveyId;
    }
}
