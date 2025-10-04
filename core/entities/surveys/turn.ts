import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";

export class Turn {
    uniqueId: string;
    modelAnswer: string;
    respondentInput: string;

    constructor(
        uniqueId: string | CryptographyUtilities = "",
        modelAnswer: string = "",
        respondentInput: string = ""
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.modelAnswer = modelAnswer;
        this.respondentInput = respondentInput;
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
