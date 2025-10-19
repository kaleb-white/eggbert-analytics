import { Question } from "../../../core/entities/surveys/question";
import type { ProxySetupServer } from "./proxy_setup_server";

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

export function dialogueContextFromProxySetupServer(
    connectionSetup: ProxySetupServer
): DialogueContext {
    return new DialogueContext(
        connectionSetup.promptContext,
        connectionSetup.questionResponseId,
        connectionSetup.question
    );
}
