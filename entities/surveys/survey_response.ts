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

    constructor(
        modelPrompts: ModelDialoguePrompt[],
        completedTurns: Turn[] = [],
        timeCreated: number = Date.now(),
        lastEdited: number = Date.now()

    ) {
        this.modelPrompts = modelPrompts
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
