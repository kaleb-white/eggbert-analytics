import type { ProxySetupClient } from "../../../entities/proxy_setup_client";

export type Start = (
    clientConnectionSetup: ProxySetupClient,
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
