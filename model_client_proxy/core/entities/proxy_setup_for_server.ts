import { Response } from "../../../core/entities/surveys/response";

export class ProxySetupForServer {
    connectionId: string;
    promptContext: string;
    response: Response;

    constructor(
        connectionId: string = "",
        promptContext: string = "",
        response: Response = new Response()
    ) {
        this.connectionId = connectionId;
        this.promptContext = promptContext;
        this.response = response;
    }
}
