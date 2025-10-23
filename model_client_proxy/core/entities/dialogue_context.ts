import { Question } from "../../../core/entities/surveys/question";
import type { Turn } from "../../../core/entities/surveys/turn";
import type { ProxySetupForServer } from "./proxy_setup_for_server";

export class DialogueContext {
    questionResponseId: string;
    promptContext: string;
    question: Question;
    turns: Turn[];

    constructor(
        promptContext: string = "",
        questionResponseId: string = "",
        question: Question = new Question(),
        turns: Turn[] = []
    ) {
        this.questionResponseId = questionResponseId;
        this.promptContext = promptContext;
        this.question = question;
        this.turns = turns;
    }
}

export function dialogueContextFromProxySetupForServer(
    connectionSetup: ProxySetupForServer
): DialogueContext {
    return new DialogueContext(
        connectionSetup.promptContext,
        connectionSetup.questionResponseId,
        connectionSetup.question,
        connectionSetup.turns
    );
}
