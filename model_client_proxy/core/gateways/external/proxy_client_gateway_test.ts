import type { ProxySetupForClient } from "../../entities/proxy_setup_for_client";
import type {
    Close,
    ProxyClientGateway,
    SendRespondentInput,
    Start,
} from "../interfaces/external/proxy_client_gateway";

export class P implements ProxyClientGateway {
    mc?: (modelChunk: string) => void;
    mmf?: () => void;

    start: Start = (
        clientConnectionSetup: ProxySetupForClient,
        callbackOnModelChunk: (modelChunk: string) => void,
        callbackOnError?: (err: string) => void,
        callbackOnModelMessageFinished?: () => void
    ): Error | null => {
        this.mc = callbackOnModelChunk;
        this.mmf = callbackOnModelMessageFinished;
        return null;
    };

    sendRespondentInput: SendRespondentInput = (
        input: string
    ): Error | null => {
        Promise.all([
            new Promise<void>((res) =>
                setTimeout(() => {
                    if (this.mc) this.mc(input);
                    res();
                }, 50)
            ),
            new Promise<void>((res) =>
                setTimeout(() => {
                    if (this.mc) this.mc("some additional text");
                    res();
                }, 1000)
            ),
            new Promise<void>((res) =>
                setTimeout(() => {
                    if (this.mc)
                        this
                            .mc(`more text: create mode 100644 app/(landing)/layout.tsx
                    create mode 100644 app/(landing)/page.tsx
                    create mode 100644 app/[...response]/layout.tsx
                    delete mode 100644 app/page.tsx
                    create mode 100644 model_client_proxy/core/entities/client_connection_setup.ts
                    rename model_client_proxy/core/entities/{connection_setup.ts => server_connection_setup.ts} (94%)
                    delete mode 100644 model_client_proxy/core/gateways/client_gateway/client.ts
                    create mode 100644 model_client_proxy/core/gateways/external/proxy_cli`);
                    res();
                }, 2000)
            ),
            new Promise<void>((res) =>
                setTimeout(() => {
                    if (this.mmf) this.mmf();
                    res();
                }, 2500)
            ),
        ]);
        return null;
    };
    close: Close = (): Error | null => {
        throw new Error("Method not implemented.");
    };
}
