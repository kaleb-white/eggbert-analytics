export class Turn {
    modelOutput?: string
    userAnswer?: string

    constructor(modelOutput?: string, userAnswer?: string) {
        this.modelOutput = modelOutput
        this.userAnswer = userAnswer
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
}
