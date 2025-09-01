import { isCryptoUtilityCreator } from "@/stable_utilities/type_checks"
import { CryptoUtilityCreator } from "../interfaces/crypto_utility_creator"
import { ModelDialoguePrompt } from "./model_dialogue_prompt"
import { Turn } from "./turn"

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
        this.uniqueId = this.assignOrCreateUniqueId(uniqueId)

        // Transcript can start as any turns given by caller
        this.transcript = completedTurns

        // Throw error on model prompts not equal to transcript length


        this.currentTurn = this.numOfTurnsTaken
        this.timeCreated = timeCreated
        this.lastEdited = lastEdited
    }

    private assignOrCreateUniqueId(uniqueId: string | CryptoUtilityCreator): string {
        const testCreateUniqueId = typeof(uniqueId) === 'string' ? uniqueId as string
            : isCryptoUtilityCreator(uniqueId) ? (uniqueId as CryptoUtilityCreator).createUniqueId()
            : "fail"
        if (testCreateUniqueId === "fail") throw new Error('UniqueId argument to survey response constructer was not of expected type!')
        return testCreateUniqueId
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
