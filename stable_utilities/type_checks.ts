import { Author } from "@/core/entities/users/author";
import { Survey } from "@entities/surveys/survey";

export function isCryptographyUtilities(obj: unknown): boolean {
    return (
        typeof obj === "object" &&
        Object.keys(obj as object).includes("createUniqueId")
    );
}

export function isSurvey(obj: unknown): boolean {
    const surveyKeys = Object.keys(new Survey("", [], [], new Author("")));
    return (
        typeof obj === "object" &&
        surveyKeys.every((key) => Object.keys(obj as object).includes(key))
    );
}
