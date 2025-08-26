import { ModelDialoguePrompt } from "./model_dialogue_prompt"
import { SurveyResponse } from "./survey_response"

export class Survey {
    private modelDialoguePrompts: ModelDialoguePrompt[]
    private surveyResponses: SurveyResponse[]
    private createdAt: number
    private lastEdited: number

    constructor(
        modelDialoguePrompts: ModelDialoguePrompt[],
        surveyResponses: SurveyResponse[],
        createdAt: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.modelDialoguePrompts = modelDialoguePrompts
        this.surveyResponses = surveyResponses
        this.createdAt = createdAt
        this.lastEdited = lastEdited
    }

    getPrompts() {
        return this.modelDialoguePrompts
    }

    getSurveyResponses() {
        return this.surveyResponses
    }

    getTimeThisCreated() {
        return this.createdAt
    }

    getTimeThisEdited() {
        return this.lastEdited
    }

    setPrompts(newPrompts: ModelDialoguePrompt[]) {
        this.modelDialoguePrompts = newPrompts
        this.setLastEditedNow()
    }

    setSurveyResponses(newSurveyResponses: SurveyResponse[]) {
        this.surveyResponses = newSurveyResponses
        this.setLastEditedNow()
    }

    setCreatedAt(newTime: number) {
        this.createdAt = newTime
        this.setLastEditedNow()
    }

    setLastEdited(newTime: number) {
        this.lastEdited = newTime
    }

    setLastEditedNow() {
        this.lastEdited = Date.now()
    }

    addResponse(newSurveyResponse: SurveyResponse) {
        this.surveyResponses = this.surveyResponses.concat(newSurveyResponse)
        this.setLastEditedNow()
    }

    addPrompt(newPrompt: ModelDialoguePrompt) {
        this.modelDialoguePrompts = this.modelDialoguePrompts.concat(newPrompt)
        this.setLastEditedNow()
    }
}
