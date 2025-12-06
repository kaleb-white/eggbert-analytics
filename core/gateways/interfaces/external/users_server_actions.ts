"use server";

import { Session } from "@/core/entities/users/session";

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

export type UserServerActions = {
    signUp(email: string, password: string): Promise<UserServerActionResult>;
    signIn(email: string, password: string): Promise<UserServerActionResult>;
    signOut(session: Session): Promise<UserServerActionResult>;
    newSessionCookie(session: Session): Promise<void>;
    updateSession(session: Session): Promise<UserServerActionResult>;
};
