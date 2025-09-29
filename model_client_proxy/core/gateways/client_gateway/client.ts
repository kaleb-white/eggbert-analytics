import { io, type Socket } from "socket.io-client";

export class ClientGatewayImpl {
    peer: Socket | null = null;

    start(
        proxyAddress: string,
        connectionId: string,
        callbackOnModelChunk: (modelChunk: string) => void
    ) {
        this.peer = io(proxyAddress, {
            extraHeaders: {
                connectionId: "test-connect",
            },
        });

        this.peer.on("modelAnswerChunk", (modelChunk) => {
            callbackOnModelChunk(modelChunk);
        });
    }

    sendRespondentInput(input: string): Error | null {
        if (!this.peer)
            return new Error(
                "Tried to send input while gateway is not started"
            );
        this.peer.emit("respondent input", input);
        return null;
    }

    close() {
        if (!this.peer)
            return new Error(
                "Tried to close client while gateway is not started"
            );
        this.peer.emit("respondent finished");
        return null;
    }
}
