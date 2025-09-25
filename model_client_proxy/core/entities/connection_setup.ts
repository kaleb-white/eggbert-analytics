export class ConnectionSetup {
    connectionId: string;
    serverToken: string;
    peerAddress: string;
    context: string;

    constructor(
        connectionId: string = "",
        context: string = "",
        serverToken: string = "",
        peerAddress: string = ""
    ) {
        this.connectionId = connectionId;
        this.context = context;
        this.serverToken = serverToken;
        this.peerAddress = peerAddress;
    }
}
