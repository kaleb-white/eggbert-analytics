import type { Response } from "../../../core/entities/surveys/response";
import type { ProxySetupForServer } from "./proxy_setup_for_server";

export class DialogueContext {
    promptContext: string;
    response: Response;

    constructor(promptContext: string = "", response: Response) {
        this.promptContext = promptContext;
        this.response = response;
    }
}

export function dialogueContextFromProxySetupForServer(
    connectionSetup: ProxySetupForServer
): DialogueContext {
    return new DialogueContext(
        connectionSetup.promptContext,
        connectionSetup.response
    );
}
