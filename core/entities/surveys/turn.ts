export class Turn {
    modelAnswer?: string;
    respondentInput?: string;

    constructor(modelAnswer?: string, respondentInput?: string) {
        this.modelAnswer = modelAnswer;
        this.respondentInput = respondentInput;
    }

    /** Returns an empty string if the turn is not complete. */
    get respondentInputAndUserAnswerAsString(): string {
        if (!this.turnWasTaken) return "";
        return `\nthe model asked: ${this.modelAnswer} \nthe user responded: ${this.respondentInput}`;
    }

    get modelAnswerExists() {
        return this.modelAnswer ? true : false;
    }

    get respondentInputExists() {
        return this.respondentInput ? true : false;
    }

    get turnWasTaken() {
        return this.modelAnswerExists || this.respondentInputExists;
    }
}
