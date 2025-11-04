import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Question } from "./question";
import { Turn } from "./turn";
import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";

export type QuestionResponseProps = {
    summary?: string;
    transcript?: Turn[];
    /** Indexed at 0 */
    currentTurn?: number;
    timeCreated?: number;
    lastEdited?: number;
    uniqueId?: string | CryptographyUtilities;
    question?: Question;
};

const defaultProps = {
    uniqueId: "",
    question: new Question(),
    transcript: [],
    timeCreated: Date.now(),
    lastEdited: Date.now(),
    summary: "",
};

export class QuestionResponse {
    summary: string;
    transcript: Turn[];
    /** Indexed at 0 */
    currentTurn: number;
    timeCreated: number;
    lastEdited: number;
    uniqueId: string;
    question: Question;

    constructor(partialProps?: QuestionResponseProps) {
        const props = partialProps ? partialProps : defaultProps;

        // Use given id or generate new one
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );

        // The question is what the response answers
        this.question = props.question ? props.question : defaultProps.question;

        // Transcript can start as any turns given by caller
        this.transcript = props.transcript
            ? props.transcript
            : defaultProps.transcript;

        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastEdited = props.lastEdited
            ? props.lastEdited
            : defaultProps.lastEdited;
        this.summary = props.summary ? props.summary : defaultProps.summary;

        this.currentTurn = this.numOfTurnsTaken;
    }

    get numOfTurnsTaken() {
        let res = 0;
        res += this.transcript.filter((turn) => turn.turnWasTaken).length;
        this.currentTurn = res;
        return res;
    }

    addTurn(turn: Turn) {
        this.transcript.push(turn);
    }
}
