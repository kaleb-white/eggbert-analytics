import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";

export class Question {
    uniqueId: string;
    modelPrompt: string;
    maxNumberOfTurns: number;

    constructor(
        uniqueId: string | CryptographyUtilities = "",
        modelPrompt: string = "",
        maxNumberOfTurns: number = 0
    ) {
        this.uniqueId = assignOrCreateUniqueId(uniqueId);
        this.modelPrompt = modelPrompt;
        this.maxNumberOfTurns = maxNumberOfTurns;
    }
}
