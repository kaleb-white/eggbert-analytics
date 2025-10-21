import type { ProxySetupForClient } from "../../../entities/proxy_setup_for_client";

export type Start = (
    clientConnectionSetup: ProxySetupForClient,
    callbackOnModelChunk: (modelChunk: string) => void,
    callbackOnError?: (err: string) => void,
    callbackOnModelMessageFinished?: () => void
) => Error | null;
export type SendRespondentInput = (input: string) => Error | null;
export type Close = () => Error | null;

export interface ProxyClientGateway {
    start: Start;
    sendRespondentInput: SendRespondentInput;
    close: Close;
}
