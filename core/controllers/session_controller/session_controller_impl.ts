import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";
import { SessionController } from "./interfaces/session_controller";
import { storage, uniqueIdGen } from "@/injections";

const msInADay = 24 * 60 * 60 * 1000;
const msIn15Days = 15 * msInADay;
const msIn30Days = 2 * msIn15Days;
/**
 * If current is not provided, returns the time 30 days from now (in ms)
 * If current is provided and is > 15 days from now, returns the time 30 days from now
 * If current is provided and is < 15 days from now, returns current
 * Reference: https://thecopenhagenbook.com/sessions#session-lifetime
 * @param current optional current time
 * @returns
 */
function decideExpiration(current?: number): number {
    if (!current) return Date.now() + msIn30Days;
    const now = Date.now();
    const timeIn15Days = now + msIn15Days;
    const timeIn30Days = now + msIn30Days;
    if (current > timeIn15Days) {
        return timeIn30Days;
    }
    return current;
}

export class SessionControllerImpl implements SessionController {
    createSessionEntity(user: User): Session {
        const session = new Session({
            uniqueId: uniqueIdGen.createUniqueId(),
            antiCsrfToken: uniqueIdGen.createUniqueId(),
            expiration: decideExpiration(),
            role: user.role,
            userId: user.uniqueId,
        });
        return session;
    }

    async createAndSaveSession(user: User): Promise<Session | Error> {
        const session = this.createSessionEntity(user);
        const saveResult = await storage.save(session.uniqueId, session);
        if (saveResult instanceof Error) return saveResult;
        return session;
    }

    async getSessions(byUser: User): Promise<Session[] | Error> {
        const sessions = await storage.getAll(
            byUser.uniqueId,
            new Session(),
            "userId"
        );

        if (!sessions) return [];
        return sessions;
    }

    /**
     * Checks for an existing database session with the exact same values and an expiration date in the future.
     * @param session the session to check
     */
    async checkSessionValid(session: Session): Promise<boolean | Error> {
        const storedSession = await storage.get(
            session.uniqueId,
            new Session()
        );
        if (storedSession instanceof Error) return storedSession;
        if (!storedSession) return false;
        const doValuesMatch = Object.keys(storedSession).every(
            (field) => session[field] === storedSession[field]
        );
        if (!doValuesMatch) return false;
        if (storedSession.expiration <= Date.now()) return false;
        return true;
    }

    async updateSession(session: Session): Promise<Error | null> {
        session.expiration = decideExpiration(session.expiration);
        const saveResult = await storage.save(session.userId, session);
        return saveResult;
    }

    /**
     * Can fail silently - a null result might mean that no session was actually deleted. However, since there is no point in telling the user that deleting their session from storage failed, the error is supressed.
     * @param id The id of the session.
     */
    async deleteSession(id: string): Promise<Error | null> {
        const deleteResult = await storage.delete(id, new Session());
        if (!deleteResult || deleteResult instanceof Error) return deleteResult;
        return null;
    }
}
