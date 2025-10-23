import { Question } from "../../../core/entities/surveys/question";
import type { Turn } from "../../../core/entities/surveys/turn";

export class ProxySetupForServer {
    connectionId: string;
    questionResponseId: string;
    promptContext: string;
    turns: Turn[];
    question: Question;

    constructor(
        connectionId: string = "",
        promptContext: string = "",
        questionResponseId: string = "",
        turns: Turn[],
        question: Question = new Question()
    ) {
        this.questionResponseId = questionResponseId;
        this.connectionId = connectionId;
        this.promptContext = promptContext;
        this.turns = turns;
        this.question = question;
    }
}
