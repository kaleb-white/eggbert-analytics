import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";

export class Turn {
    uniqueId: string;
    modelMessage: string;
    respondentMessage: string;
    timeCreated: number;
    lastEdited: number;

    constructor(
        uniqueId: string | CryptographyUtilities = "",
        modelMessage: string = "",
        respondentMessage: string = "",
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.modelMessage = modelMessage;
        this.respondentMessage = respondentMessage;
        this.timeCreated = timeCreated;
        this.lastEdited = lastEdited;
    }

    /** Returns an empty string if the turn is not complete. */
    get respondentMessageAndUserAnswerAsString(): string {
        if (!this.turnWasTaken) return "";
        return `\nthe model asked: ${this.modelMessage} \nthe user responded: ${this.respondentMessage}`;
    }

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
