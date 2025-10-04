import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";

export class Question {
    uniqueId: string;
    modelPrompt: string;
    maxNumberOfTurns: number;
    timeCreated: number;
    lastEdited: number;

    constructor(
        uniqueId: string | CryptographyUtilities = "",
        modelPrompt: string = "",
        maxNumberOfTurns: number = 0,
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.modelPrompt = modelPrompt;
        this.maxNumberOfTurns = maxNumberOfTurns;
        this.timeCreated = timeCreated;
        this.lastEdited = lastEdited;
    }
}
