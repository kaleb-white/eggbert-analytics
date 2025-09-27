export class Question {
    modelPrompt: string;
    maxNumberOfTurns: number;

    constructor(modelPrompt: string = "", maxNumberOfTurns: number = 0) {
        this.modelPrompt = modelPrompt;
        this.maxNumberOfTurns = maxNumberOfTurns;
    }
}
