import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../../controllers/crypto/interfaces/crypto_utility_creator";

export type QuestionProps = {
    uniqueId?: string | CryptographyUtilities;
    question?: string;
    modelPrompt?: string;
    maxNumberOfTurns?: number;
    timeCreated?: number;
    lastEdited?: number;
};

const defaultProps = {
    uniqueId: "",
    question: "",
    modelPrompt: "",
    maxNumberOfTurns: 0,
    timeCreated: Date.now(),
    lastEdited: Date.now(),
};

export class Question {
    uniqueId: string;
    question: string;
    modelPrompt: string;
    maxNumberOfTurns: number;
    timeCreated: number;
    lastEdited: number;

    constructor(partialProps?: QuestionProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );
        this.question = props.question ? props.question : defaultProps.question;
        this.modelPrompt = props.modelPrompt
            ? props.modelPrompt
            : defaultProps.modelPrompt;
        this.maxNumberOfTurns = props.maxNumberOfTurns
            ? props.maxNumberOfTurns
            : defaultProps.maxNumberOfTurns;
        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastEdited = props.lastEdited
            ? props.lastEdited
            : defaultProps.lastEdited;
    }
}
