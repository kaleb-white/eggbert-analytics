"use server";
import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";
import {
    UserServerActionError,
    UserServerActionResult,
    UserServerActions,
} from "../interfaces/external/users_server_actions";
import { cookies } from "next/headers";
import { z, ZodSafeParseError } from "zod/v4";
import { sessionController, uniqueIdGen, userController } from "@/injections";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const zodPassword = z.object({ password: z.string().min(8).max(256) });

function stringArrayToErrorArray(strings: string[]): Error[] {
    return strings.map((string) => new Error(string));
}

function addZodErrorsToTracker(
    tracker: UserServerActionError,
    error: ZodSafeParseError<unknown>
) {
    const errorTree = z.flattenError(error.error);
    Object.keys(errorTree.fieldErrors).forEach((field) => {
        const errorsOnField = errorTree.fieldErrors[field] as
            | string[]
            | undefined;
        if (errorsOnField) {
            tracker.errorCount += errorsOnField.length;
            tracker[field] = stringArrayToErrorArray(errorsOnField);
        }
    });
}

function createCookieConfiguration(expires: number): Partial<ResponseCookie> {
    return {
        httpOnly: false,
        expires: expires,
        sameSite: "lax",
        secure: true,
        path: "/",
    };
}

const UserServerActionsImpl: UserServerActions = {
    updateSession: async (
        session: Session
    ): Promise<UserServerActionResult> => {
        throw new Error("Method not implemented.");
    },

    signUp: async (
        email: string,
        password: string
    ): Promise<UserServerActionResult> => {
        // Validate form input
        const errors: UserServerActionResult = {
            succesful: false,
            errorCount: 0,
        };
        const parseEmailErrors = z
            .object({ email: z.email() })
            .safeParse({ email: email });
        const parsePasswordErrors = zodPassword.safeParse({
            password: password,
        });

        if (!parseEmailErrors.success) {
            addZodErrorsToTracker(errors, parseEmailErrors);
        }
        if (!parsePasswordErrors.success) {
            addZodErrorsToTracker(errors, parsePasswordErrors);
        }

        if (errors.errorCount > 0) return errors;

        // Create user
        const user = new User({
            email: email,
            lastLogin: Date.now(),
            role: "respondent",
            timeCreated: Date.now(),
            uniqueId: uniqueIdGen.createUniqueId(),
        });

        // Try and persist user and password
        const userSaveResult = await userController.createOrUpdateUser(
            user,
            password
        );
        if (userSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["other"] = [new Error(userSaveResult.message)];
            return errors;
        }

        // Try and create session
        const sessionSaveResult = await sessionController.createAndSaveSession(
            user
        );
        if (sessionSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["other"] = [new Error(sessionSaveResult.message)];
            return errors;
        }
        // TODO: delete old session and migrate responses
        // Set cookies
        const cookieStore = await cookies();
        if (cookieStore.get("session")) {
            cookieStore.delete("session");
        }
        cookieStore.set(
            "session",
            JSON.stringify(sessionSaveResult),
            createCookieConfiguration(sessionSaveResult.expiration)
        );

        return { succesful: true, message: "Success!" };
    },

    signIn: async (
        email: string,
        password: string
    ): Promise<UserServerActionResult> => {
        const errors: UserServerActionResult = {
            succesful: false,
            errorCount: 0,
        };

        // Validate input
        const parseEmailErrors = z.email().safeParse(email);
        const parsePasswordErrors = zodPassword.safeParse({
            password: password,
        });

        if (!parseEmailErrors.success) {
            addZodErrorsToTracker(errors, parseEmailErrors);
        }
        if (!parsePasswordErrors.success) {
            addZodErrorsToTracker(errors, parsePasswordErrors);
        }

        if (errors.errorCount > 0) return errors;

        // Get user by email
        const checkPasswordMatch = await userController.checkPasswordMatch(
            email,
            password
        );
        if (!(typeof checkPasswordMatch === "boolean") && !checkPasswordMatch) {
            errors.errorCount = 1;
            errors["other"] = [new Error("No user found with that email")];
            return errors;
        }
        if (checkPasswordMatch instanceof Error) {
            errors.errorCount = 1;
            errors["other"] = [new Error(checkPasswordMatch.message)];
            return errors;
        }
        if (!checkPasswordMatch) {
            errors.errorCount = 1;
            errors["other"] = [new Error("Password was incorrect")];
            return errors;
        }

        // Create a new session
        const user = await userController.getUserByEmail(email);
        if (!user || user instanceof Error) {
            errors.errorCount = 1;
            errors["other"] = [
                new Error(
                    `Password was correct, but user then wasn't found in database! Contact us and sorry for the issue!${
                        user instanceof Error
                            ? `Error was: ${user.message}`
                            : ""
                    }`
                ),
            ];
            return errors;
        }
        const sessionSaveResult = await sessionController.createAndSaveSession(
            user
        );
        if (sessionSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["other"] = [
                new Error(
                    `Failed to save session: ${sessionSaveResult.message}`
                ),
            ];
            return errors;
        }
        if (sessionSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["other"] = [new Error(sessionSaveResult.message)];
            return errors;
        }

        // Save cookies
        const cookieStore = await cookies();
        if (cookieStore.get("session")) {
            cookieStore.delete("session");
        }
        cookieStore.set(
            "session",
            JSON.stringify(sessionSaveResult),
            createCookieConfiguration(sessionSaveResult.expiration)
        );

        return { succesful: true, message: "Signed in!" };
    },

    signOut: async (session: Session): Promise<UserServerActionResult> => {
        throw new Error("Method not implemented.");
    },

    newSessionCookie: async (session: Session): Promise<void> => {
        // Save cookies
        const cookieStore = await cookies();
        if (cookieStore.get("session")) {
            cookieStore.delete("session");
        }
        cookieStore.set(
            "session",
            JSON.stringify(session),
            createCookieConfiguration(session.expiration)
        );
    },
};

export const signUp = UserServerActionsImpl.signUp;
export const signIn = UserServerActionsImpl.signIn;
export const signOut = UserServerActionsImpl.signOut;
export const newSessionCookie = UserServerActionsImpl.newSessionCookie;
export const updateSession = UserServerActionsImpl.updateSession;
