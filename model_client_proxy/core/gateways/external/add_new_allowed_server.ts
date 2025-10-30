import type { ProxySetupForServer } from "../../entities/proxy_setup_for_server";
import { createConnectionRouteName, PORT } from "../../../config";

export async function addNewAllowedConnection(proxySetup: ProxySetupForServer) {
    if (!process.env.EXPECTED_SERVER_TOKEN)
        throw new Error(
            "No server token found. There must be a matching server token shared between the proxy and the server."
        );

    const body = {
        connectionSetup: JSON.stringify(proxySetup),
        serverToken: process.env.EXPECTED_SERVER_TOKEN,
    };

    let fetchResult;
    try {
        fetchResult = await fetch(
            `http://localhost:${PORT}/${createConnectionRouteName}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: process.env.EXPECTED_SERVER_TOKEN,
                },
                body: JSON.stringify(body),
            }
        );
    } catch (err) {
        fetchResult = err;
    }

    return fetchResult;
}
