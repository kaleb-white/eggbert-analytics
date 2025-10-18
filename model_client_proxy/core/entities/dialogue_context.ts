import { Question } from "../../../core/entities/surveys/question";
import type { ServerConnectionSetup } from "./server_connection_setup";

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

export function dialogueContextFromServerConnectionSetup(
    connectionSetup: ServerConnectionSetup
): DialogueContext {
    return new DialogueContext(
        connectionSetup.promptContext,
        connectionSetup.questionResponseId,
        connectionSetup.question
    );
}
