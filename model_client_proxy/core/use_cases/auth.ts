import type { Request } from "express";

export function checkRawServerToken(serverToken: string): boolean {
    return serverToken == process.env.EXPECTED_SERVER_TOKEN;
}

export function checkServerToken(request: Request) {
    if (
        !Object.keys(request).includes("headers") ||
        !Object.keys(request.headers).includes("authorization")
    )
        return false;

    return (
        request.headers.authorization &&
        request.headers.authorization == process.env.EXPECTED_SERVER_TOKEN
    );
}
