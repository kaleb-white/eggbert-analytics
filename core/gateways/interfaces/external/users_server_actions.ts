"use server";

import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";

export interface UserServerActionError {
    [index: string]: Error[] | boolean | number;
    succesful: false;
    errorCount: number;
}
export interface UserServerActionSuccess {
    succesful: true;
    message?: string;
}

export type UserServerActionResult =
    | UserServerActionError
    | UserServerActionSuccess;

export interface UserServerActions {
    signUp(user: User, password: string): Promise<UserServerActionResult>;
    signIn(email: string, password: string): Promise<UserServerActionResult>;
    signOut(session: Session): Promise<UserServerActionResult>;
    updateSession(session: Session): Promise<UserServerActionResult>;
}
