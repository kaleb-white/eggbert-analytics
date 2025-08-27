import { ModelDialoguePrompt } from "./model_dialogue_prompt";

export class Turn {
    private dialoguePrompt: ModelDialoguePrompt
    private modelOutput: string | undefined
    private userAnswer: string | undefined

    constructor(dialoguePrompt: ModelDialoguePrompt, modelOutput?: string, userAnswer?: string) {
        this.dialoguePrompt = dialoguePrompt
        this.modelOutput = modelOutput
        this.userAnswer = userAnswer
    }

    get getDialoguePrompt() {
        return this.dialoguePrompt
    }

    get getModelOutput() {
        return this.modelOutput
    }

    get getUserAnswer() {
        return this.userAnswer
    }

    /** Returns an empty string if the turn is not complete. */
    get modelOutputAndUserAnswerAsString(): string {
        if (!this.turnWasTaken) return ""
        return `\nthe model asked: ${this.modelOutput} \nthe user responded: ${this.userAnswer}`
    }

    get modelOutputExists() {
        return this.modelOutput? true : false
    }

    get userAnswerExists() {
        return this.userAnswer? true: false
    }

    get turnWasTaken() {
        return this.modelOutputExists || this.userAnswerExists
    }

    set setDialoguePrompt(newDialoguePrompt: ModelDialoguePrompt) {
        this.dialoguePrompt = newDialoguePrompt
    }

    set setModelOutput(userCreatedModelOutput: string) {
        this.modelOutput = userCreatedModelOutput
    }

    set setUserAnswer(newUserAnswer: string) {
        this.userAnswer = newUserAnswer
    }
}
