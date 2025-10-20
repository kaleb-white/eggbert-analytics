import { Question } from "../../../core/entities/surveys/question";

export class ProxySetupServer {
    connectionId: string;
    questionResponseId: string;
    promptContext: string;
    question: Question;

    constructor(
        connectionId: string = "",
        promptContext: string = "",
        questionResponseId: string = "",
        question: Question = new Question()
    ) {
        this.questionResponseId = questionResponseId;
        this.connectionId = connectionId;
        this.promptContext = promptContext;
        this.question = question;
    }
}
