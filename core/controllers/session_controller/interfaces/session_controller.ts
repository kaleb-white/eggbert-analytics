import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";

export interface SessionController {
    createAndSaveSession(user: User): Promise<Session | Error>;
}
