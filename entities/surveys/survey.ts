import { ModelDialoguePrompt } from "./model_dialogue_prompt"
import { Response } from "./response"

export class Survey {
    modelDialoguePrompts: ModelDialoguePrompt[]
    responses: Response[]
    createdAt: number
    lastEdited: number

    constructor(
        modelDialoguePrompts: ModelDialoguePrompt[],
        responses: Response[],
        createdAt: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.modelDialoguePrompts = modelDialoguePrompts
        this.responses = responses
        this.createdAt = createdAt
        this.lastEdited = lastEdited
    }
}
