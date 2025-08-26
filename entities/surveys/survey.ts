import { ModelDialoguePrompt } from "./model_dialogue_prompt"
import { surveyResponse } from "./survey_response"

export class Survey {
    modelDialoguePrompts: ModelDialoguePrompt[]
    surveyResponses: surveyResponse[]
    createdAt: number
    lastEdited: number

    constructor(
        modelDialoguePrompts: ModelDialoguePrompt[],
        surveyResponses: surveyResponse[],
        createdAt: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.modelDialoguePrompts = modelDialoguePrompts
        this.surveyResponses = surveyResponses
        this.createdAt = createdAt
        this.lastEdited = lastEdited
    }
}
