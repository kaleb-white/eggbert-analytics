import { Question } from "../../../core/entities/surveys/question";

export class DialogueContext {
    surveyResponseId: string;
    promptContext: string;
    question: Question;

    constructor(
        promptContext: string = "",
        surveyResponseId: string = "",
        question: Question = new Question()
    ) {
        this.surveyResponseId = surveyResponseId;
        this.promptContext = promptContext;
        this.question = question;
    }
}
