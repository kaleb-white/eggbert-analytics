import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";

export class Turn {
    uniqueId: string;
    modelAnswer: string;
    respondentInput: string;
    timeCreated: number;
    lastEdited: number;

    constructor(
        uniqueId: string | CryptographyUtilities = "",
        modelAnswer: string = "",
        respondentInput: string = "",
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.modelAnswer = modelAnswer;
        this.respondentInput = respondentInput;
        this.timeCreated = timeCreated;
        this.lastEdited = lastEdited;
    }

    /** Returns an empty string if the turn is not complete. */
    get respondentInputAndUserAnswerAsString(): string {
        if (!this.turnWasTaken) return "";
        return `\nthe model asked: ${this.modelAnswer} \nthe user responded: ${this.respondentInput}`;
    }

    get modelAnswerExists() {
        return this.modelAnswer ? true : false;
    }

    get respondentInputExists() {
        return this.respondentInput ? true : false;
    }

    get turnWasTaken() {
        return this.modelAnswerExists || this.respondentInputExists;
    }
}
