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
import { Roles } from "@/core/entities/users/user_roles";
import { sessionController, uniqueIdGen, userController } from "@/injections";

const zodUser = z.object({
    role: z.literal(Roles), // Stupid
    email: z.email(),
    uniqueId: z.string(),
    timeCreated: z.number(),
    lastLogin: z.number(),
});

const zodPassword = z.string().min(8).max(256);

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

export class UserServerActionsImpl implements UserServerActions {
    updateSession(session: Session): Promise<UserServerActionResult> {
        throw new Error("Method not implemented.");
    }

    async signUp(
        user: User,
        password: string
    ): Promise<UserServerActionResult> {
        // Validate form input
        const errors: UserServerActionResult = {
            succesful: false,
            errorCount: 0,
        };
        const parseUserErrors = zodUser.safeParse({
            role: user.role,
            email: user.email,
            uniqueId: user.uniqueId,
            timeCreated: user.timeCreated,
            lastLogin: user.lastLogin,
        });
        const parsePasswordErrors = zodPassword.safeParse(password);

        if (!parseUserErrors.success) {
            addZodErrorsToTracker(errors, parseUserErrors);
        }
        if (!parsePasswordErrors.success) {
            addZodErrorsToTracker(errors, parsePasswordErrors);
        }

        if (errors.errorCount > 0) return errors;

        // Try and persist user and password
        user.uniqueId = uniqueIdGen.createUniqueId(); // Ignore whatever id they used
        const userSaveResult = await userController.createOrUpdateUser(
            user,
            password
        );
        if (userSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["Failed to save user"] = [new Error(userSaveResult.message)];
            return errors;
        }

        // Try and create session
        const sessionSaveResult = await sessionController.createAndSaveSession(
            user
        );
        if (sessionSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["Failed to save session"] = [
                new Error(sessionSaveResult.message),
            ];
            return errors;
        }
        // TODO: delete old session and migrate responses

        // Set cookies
        const cookieStore = await cookies();
        if (cookieStore.get("session")) {
            cookieStore.delete("session");
        }
        cookieStore.set("session", JSON.stringify(sessionSaveResult));

        return { succesful: true, message: "Success!" };
    }

    async signIn(
        email: string,
        password: string
    ): Promise<UserServerActionResult> {
        const errors: UserServerActionResult = {
            succesful: false,
            errorCount: 0,
        };

        // Validate input
        const parseEmailErrors = z.email().safeParse(email);
        const parsePasswordErrors = zodPassword.safeParse(password);

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
            errors["No user found"] = [
                new Error("No user found with that email"),
            ];
            return errors;
        }
        if (checkPasswordMatch instanceof Error) {
            errors.errorCount = 1;
            errors["Error while finding user"] = [
                new Error(checkPasswordMatch.message),
            ];
            return errors;
        }
        if (!checkPasswordMatch) {
            errors.errorCount = 1;
            errors["Wrong password"] = [new Error("Password was incorrect")];
            return errors;
        }

        // Create a new session
        const user = await userController.getUserByEmail(email);
        if (!user || user instanceof Error) {
            errors.errorCount = 1;
            errors["Hmm, this shouldn't happen"] = [
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
        const sessionSaveResult = sessionController.createAndSaveSession(user);
        if (sessionSaveResult instanceof Error) {
            errors.errorCount = 1;
            errors["Failed to save session"] = [
                new Error(sessionSaveResult.message),
            ];
            return errors;
        }

        return { succesful: true, message: "Signed in!" };
    }
    signOut(session: Session): Promise<UserServerActionResult> {
        throw new Error("Method not implemented.");
    }
}
