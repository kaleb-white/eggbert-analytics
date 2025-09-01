import { isCryptoUtilityCreator } from "@/stable_utilities/type_checks"
import { CryptoUtilityCreator } from "../interfaces/crypto_utility_creator"
import { ModelDialoguePrompt } from "./model_dialogue_prompt"
import { Turn } from "./turn"
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid"

export class SurveyResponse {
    summary?: string
    transcript: Turn[]
    modelPrompts: ModelDialoguePrompt[]
    /** Indexed at 0 */
    currentTurn: number
    timeCreated: number
    lastEdited: number
    uniqueId: string

    constructor(
        modelPrompts: ModelDialoguePrompt[],
        uniqueId: string | CryptoUtilityCreator,
        completedTurns: Turn[] = [],
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()

    ) {
        this.modelPrompts = modelPrompts

        // Use given id or generate new one
        this.uniqueId = assignOrCreateUniqueId(uniqueId)

        // Transcript can start as any turns given by caller
        this.transcript = completedTurns

        this.currentTurn = this.numOfTurnsTaken
        this.timeCreated = timeCreated
        this.lastEdited = lastEdited
    }

    get numOfTurnsTaken() {
        let res = 0
        res += this.transcript.filter(turn => turn.turnWasTaken).length
        return res
    }

    get dialogueAsString() {
        return this.transcript.map(
                turn => turn.modelOutputAndUserAnswerAsString
            )
            .join("")
            .replace(/^\n/, "")
    }
}
