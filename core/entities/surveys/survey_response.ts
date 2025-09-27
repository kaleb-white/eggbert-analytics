import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Question } from "./question";
import { Turn } from "./turn";
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";

export class SurveyResponse {
    summary?: string;
    transcript: Turn[];
    /** Indexed at 0 */
    currentTurn: number;
    timeCreated: number;
    lastEdited: number;
    uniqueId: string;
    question: Question;

    constructor(
        uniqueId: string | CryptographyUtilities,
        question: Question,
        completedTurns: Turn[] = [],
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        // Use given id or generate new one
        this.uniqueId = assignOrCreateUniqueId(uniqueId);

        // The question is what the response answers
        this.question = question;

        // Transcript can start as any turns given by caller
        this.transcript = completedTurns;

        this.currentTurn = this.numOfTurnsTaken;
        this.timeCreated = timeCreated;
        this.lastEdited = lastEdited;
    }

    get fullTranscript() {
        return this.transcript;
    }

    get numOfTurnsTaken() {
        let res = 0;
        res += this.transcript.filter((turn) => turn.turnWasTaken).length;
        this.currentTurn = res;
        return res;
    }

    get dialogueAsString() {
        return this.transcript
            .map((turn) => turn.respondentInputAndUserAnswerAsString)
            .join("")
            .replace(/^\n/, "");
    }

    addTurn(turn: Turn) {
        this.transcript.push(turn);
    }
}
