import { io, type Socket } from "socket.io-client";
import type { ProxySetupClient } from "../../entities/proxy_setup_client";
import type {
    Close,
    ProxyClientGateway,
    SendRespondentInput,
    Start,
} from "../interfaces/external/proxy_client_gateway";

// Try and keep dependencies low... remember, this has to be sent to client!

export class ProxyClientGatewayImpl implements ProxyClientGateway {
    peer: Socket | null = null;

    start: Start = (
        clientConnectionSetup: ProxySetupClient,
        callbackOnModelChunk: (modelChunk: string) => void,
        callbackOnError?: (err: string) => void,
        callbackOnModelMessageFinished?: () => void
    ) => {
        // Connect with required 'connectionId' header
        this.peer = io(clientConnectionSetup.proxyAddress, {
            extraHeaders: {
                connectionId: clientConnectionSetup.connectionId,
            },
        });

        // Check for connection errors
        let connectionError = null;
        this.peer.io.on("error", (err) => {
            connectionError = err;
        });
        if (connectionError) return connectionError;

        // Setup callbacks
        this.peer.on("modelMessageChunk", (modelChunk) => {
            callbackOnModelChunk(modelChunk);
        });

        this.peer.on("error", (err) => {
            if (callbackOnError) callbackOnError(err);
        });

        this.peer.on("modelMessageFinished", () => {
            if (callbackOnModelMessageFinished)
                callbackOnModelMessageFinished();
        });
        return null;
    };

    sendRespondentInput: SendRespondentInput = (
        input: string
    ): Error | null => {
        if (!this.peer)
            return new Error(
                "Tried to send input while gateway is not started"
            );
        this.peer.emit("respondent input", input);
        return null;
    };

    close: Close = () => {
        if (!this.peer)
            return new Error(
                "Tried to close client while gateway is not started"
            );
        this.peer.emit("respondent finished");
        return null;
    };
}
