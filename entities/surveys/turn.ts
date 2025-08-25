import { ModelDialoguePrompt } from "./model_dialogue_prompt";

export class Turn {
    dialoguePrompt: ModelDialoguePrompt
    modelOutput: string
    userAnswer: string
    order: number

    constructor(dialoguePrompt: ModelDialoguePrompt, modelOutput: string, userAnswer: string, order: number) {
        this.dialoguePrompt = dialoguePrompt
        this.modelOutput = modelOutput
        this.userAnswer = userAnswer
        this.order = order
    }
}
