import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../../controllers/crypto/interfaces/crypto_utility_creator";

export type TurnProps = {
    uniqueId?: string | CryptographyUtilities;
    modelMessage?: string;
    respondentMessage?: string;
    timeCreated?: number;
    lastEdited?: number;
    questionResponseId?: string;
};

const defaultProps = {
    uniqueId: "",
    modelMessage: "",
    respondentMessage: "",
    timeCreated: Date.now(),
    lastEdited: Date.now(),
    questionResponseId: "",
};

export class Turn {
    uniqueId: string;
    modelMessage: string;
    respondentMessage: string;
    timeCreated: number;
    lastEdited: number;
    questionResponseId: string;

    constructor(partialProps?: TurnProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );
        this.modelMessage = props.modelMessage
            ? props.modelMessage
            : defaultProps.modelMessage;
        this.respondentMessage = props.respondentMessage
            ? props.respondentMessage
            : defaultProps.respondentMessage;
        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastEdited = props.lastEdited
            ? props.lastEdited
            : defaultProps.lastEdited;
        this.questionResponseId = props.questionResponseId
            ? props.questionResponseId
            : defaultProps.questionResponseId;
    }

    /** Returns an empty string if the turn is not complete. */
    get modelMessageExists() {
        return this.modelMessage ? true : false;
    }

    get respondentMessageExists() {
        return this.respondentMessage ? true : false;
    }

    get turnWasTaken() {
        return this.modelMessageExists || this.respondentMessageExists;
    }
}
