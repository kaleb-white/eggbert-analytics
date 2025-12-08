import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Response } from "@/core/entities/surveys/response";
import { Turn } from "@/core/entities/surveys/turn";
import { Password } from "@/core/entities/users/password";
import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";
import { Survey } from "@entities/surveys/survey";

function doUnorderedArraysMatch(arr1: unknown[], arr2: unknown[]): boolean {
    if (arr1.length != arr2.length) return false;

    const sorted1 = arr1.slice().sort();
    const sorted2 = arr2.slice().sort();

    for (let i = 0; i < arr1.length; i++) {
        if (sorted1[i] != sorted2[i]) {
            return false;
        }
    }
    return true;
}

export function isCryptographyUtilities(obj: unknown): boolean {
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        Object.keys(obj as object).includes("createUniqueId")
    );
}

export function isSurvey(obj: unknown): boolean {
    const keys = Object.keys(new Survey());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isResponse(obj: unknown): boolean {
    const keys = Object.keys(new Response());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isQuestionResponse(obj: unknown): boolean {
    const keys = Object.keys(new QuestionResponse());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isQuestion(obj: unknown): boolean {
    const keys = Object.keys(new Question());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isTurn(obj: unknown): boolean {
    const keys = Object.keys(new Turn());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isSession(obj: unknown): boolean {
    const keys = Object.keys(new Session());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj == "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isUser(obj: unknown): boolean {
    const keys = Object.keys(new User());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj == "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

// These are all subsets of user, so check is slightly different
export function isRespondent(obj: unknown): boolean {
    const keys = Object.keys(new User());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object)) &&
        (obj as User).role &&
        (obj as User).role == "respondent"
    );
}

export function isAuthor(obj: unknown): boolean {
    const keys = Object.keys(new User());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object)) &&
        (obj as User).role &&
        (obj as User).role == "author"
    );
}

export function isAnonymous(obj: unknown): boolean {
    const keys = Object.keys(new User());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object)) &&
        (obj as User).role &&
        (obj as User).role == "anonymous"
    );
}

export function isPassword(obj: unknown): boolean {
    const keys = Object.keys(new Password());
    if (!obj) return false;
    return (
        !(typeof obj === "undefined") &&
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}
