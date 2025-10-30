import { type Server } from "bun";

type HasErrorCode = {
    code: string;
};

/**
 * Attempts to start a server by running Bun.serve. Checks if there is a resulting error with an error codee of "EADDRINUSE", in which case, the port is in use..
 * @param port The port to run the server on.
 */
export function isProcessRunningOnPort(port: number): boolean {
    let server: Server<undefined>;
    try {
        server = Bun.serve({
            port: port,
            fetch(_req) {
                return new Response("404");
            },
        });
    } catch (err) {
        if (
            Object.keys(err as object).includes("code") &&
            (err as HasErrorCode).code == "EADDRINUSE"
        )
            return true;
        throw err;
    }
    server.stop(true);
    return false;
}
