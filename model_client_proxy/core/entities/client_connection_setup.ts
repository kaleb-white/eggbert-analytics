export class ClientConnectionSetup {
    proxyAddress: string;
    connectionId: string;

    constructor(proxyAddress: string, connectionId: string) {
        this.proxyAddress = proxyAddress;
        this.connectionId = connectionId;
    }
}
