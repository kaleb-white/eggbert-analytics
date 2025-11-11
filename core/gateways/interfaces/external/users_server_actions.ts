"use server";

import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";

export interface UserServerActions {
    signUp(
        user: User,
        session: Session,
        password: string
    ): Promise<Error[] | null>;
    signIn(email: string, password: string): Promise<Error[] | null>;
    signOut(session: Session): Promise<Error[] | null>;
}
