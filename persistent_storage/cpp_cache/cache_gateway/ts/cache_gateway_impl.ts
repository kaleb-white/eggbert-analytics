import * as net from "net";

import {
    message_to_protocol_format,
    protocol_format_to_message,
} from "./utilities/utilities";
import type { CacheGateway } from "./cache_gateway";

export class CacheGatewayImpl implements CacheGateway {
    PORT_NUMBER: number = 1037;
    client: net.Socket | null = null;

    async connect(): Promise<null | Error> {
        if (!this.client) {
            this.client = new net.Socket();
            try {
                this.client.connect(this.PORT_NUMBER, () => {});
            } catch (e) {
                return e as Error;
            }
        }
        return null;
    }

    async send(message: string): Promise<string | Error> {
        if (!this.client) {
            const connect_result = await this.connect();
            if (connect_result instanceof Error) {
                return connect_result;
            }
        }

        return new Promise((resolve, reject) => {
            let socket_error: Error | null = null;

            this.client?.on("error", (err: Error) => {
                socket_error = err;
                reject(socket_error);
            });

            this.client?.on("timeout", () => {
                socket_error = new Error("Socket timed out");
                reject(socket_error);
            });

            this.client?.on("data", (buffer) => {
                const data = buffer.toString();
                resolve(protocol_format_to_message(data));
            });

            this.client?.write(message);
        });
    }

    async create(id: string, value: string): Promise<null | Error> {
        const message = message_to_protocol_format(
            "create ".concat(id).concat(" ").concat(value)
        );
        const send_result = await this.send(message);
        if (send_result instanceof Error) {
            return send_result;
        }
        if (send_result.includes("Error")) {
            return new Error(send_result);
        }
        if (send_result.includes("Success!")) {
            return null;
        }
        return new Error("Cache returned an unexpected value: " + send_result);
    }

    async read(id: string): Promise<string | Error> {
        const message = message_to_protocol_format("read ".concat(id));
        const send_result = await this.send(message);
        if (send_result instanceof Error) {
            return send_result;
        }
        if (send_result.includes("Error")) {
            return new Error(send_result);
        }
        return send_result;
    }

    async update(id: string, value: string): Promise<null | Error> {
        return this.create(id, value);
    }

    async delete(id: string): Promise<null | Error> {
        const message = message_to_protocol_format("delete ".concat(id));
        const send_result = await this.send(message);
        if (send_result instanceof Error) {
            return send_result;
        }
        if (send_result.includes("Error")) {
            return new Error(send_result);
        }
        if (send_result.includes("Success!")) {
            return null;
        }
        return new Error("Cache returned an unexpected value: " + send_result);
    }
}
