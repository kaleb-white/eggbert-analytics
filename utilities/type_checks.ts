import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Response } from "@/core/entities/surveys/response";
import { Turn } from "@/core/entities/surveys/turn";
import { Author } from "@/core/entities/users/author";
import { Respondent } from "@/core/entities/users/respondent";
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
    return (
        typeof obj === "object" &&
        Object.keys(obj as object).includes("createUniqueId")
    );
}

export function isSurvey(obj: unknown): boolean {
    const keys = Object.keys(new Survey());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isResponse(obj: unknown): boolean {
    const keys = Object.keys(new Response());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isQuestionResponse(obj: unknown): boolean {
    const keys = Object.keys(new QuestionResponse());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isQuestion(obj: unknown): boolean {
    const keys = Object.keys(new Question());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isTurn(obj: unknown): boolean {
    const keys = Object.keys(new Turn());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isUser(obj: unknown): boolean {
    const keys = Object.keys(new User());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isRespondent(obj: unknown): boolean {
    const keys = Object.keys(new Respondent());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}

export function isAuthor(obj: unknown): boolean {
    const keys = Object.keys(new Author());
    return (
        typeof obj === "object" &&
        doUnorderedArraysMatch(keys, Object.keys(obj as object))
    );
}
