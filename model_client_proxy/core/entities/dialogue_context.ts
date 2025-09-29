import { Question } from "../../../core/entities/surveys/question";
import type { ConnectionSetup } from "./connection_setup";

export class DialogueContext {
    questionResponseId: string;
    promptContext: string;
    question: Question;

    constructor(
        promptContext: string = "",
        questionResponseId: string = "",
        question: Question = new Question()
    ) {
        this.questionResponseId = questionResponseId;
        this.promptContext = promptContext;
        this.question = question;
    }
}

export function dialogueContextFromConnectionSetup(
    connectionSetup: ConnectionSetup
): DialogueContext {
    return new DialogueContext(
        connectionSetup.promptContext,
        connectionSetup.questionResponseId,
        connectionSetup.question
    );
}
