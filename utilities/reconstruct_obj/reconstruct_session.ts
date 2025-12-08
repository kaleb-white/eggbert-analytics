import { Session } from "@/core/entities/users/session";

export function reconstructSession(session: string | Session) {
    const asSession =
        typeof session === "string"
            ? (JSON.parse(session as string) as Session)
            : (session as Session);

    return new Session({
        uniqueId: asSession.uniqueId,
        antiCsrfToken: asSession.antiCsrfToken,
        userId: asSession.userId,
        role: asSession.role,
        expiration: asSession.expiration,
    });
}
