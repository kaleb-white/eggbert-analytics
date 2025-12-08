import { SurveyError } from "@/app/errors/_entities";
import { ResponseError } from "openai/resources/responses/responses.mjs";

/**
 * @param errorObject The object to encode
 * @returns A string with the search parameter 'err' set to equal the result of encoded the errorObject. For example `?err=resultOfEncodingErrorObject`.
 */
export function encodeErrorToUri(errorObject: SurveyError | ResponseError) {
    return "?err=".concat(encodeURI(JSON.stringify(errorObject)));
}

export function decodeErrorFromUri<T extends object>(
    searchParams: string | string[] | undefined,
    expected_fields: string[]
): T | null {
    let result: T;
    if (!searchParams) return null;
    if (Array.isArray(searchParams)) return null;
    try {
        result = JSON.parse(decodeURI(searchParams));
    } catch {
        return null;
    }
    if (!expected_fields.every((field) => Object.keys(result).includes(field)))
        return null;
    return result;
}
