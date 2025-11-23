import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";

export interface SessionController {
    createSessionEntity(user: User): Session;
    createAndSaveSession(user: User): Promise<Session | Error>;
    getSessions(byUser: User): Promise<Session[] | Error>;
    checkSessionValid(session: Session): Promise<boolean | Error>;
    updateSession(session: Session): Promise<Error | null>;
}
