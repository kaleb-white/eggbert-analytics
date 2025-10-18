import type { ClientConnectionSetup } from "../../../entities/client_connection_setup";

export interface ProxyClientGateway {
    start(
        clientConnectionSetup: ClientConnectionSetup,
        callbackOnModelChunk: (modelChunk: string) => void,
        callbackOnError?: (err: string) => void,
        callbackOnModelMessageFinished?: () => void
    ): Error | null;

    sendRespondentInput(input: string): Error | null;

    close(): Error | null;
}
