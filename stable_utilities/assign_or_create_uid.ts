import { CryptographyUtilities } from "@/core/entities/interfaces/crypto_utility_creator";
import { isCryptographyUtilities } from "./type_checks";

export function assignOrCreateUniqueId(
    uniqueId: string | CryptographyUtilities
): string {
    const testCreateUniqueId =
        typeof uniqueId === "string"
            ? (uniqueId as string)
            : isCryptographyUtilities(uniqueId)
            ? (uniqueId as CryptographyUtilities).createUniqueId()
            : "fail";
    if (testCreateUniqueId === "fail")
        throw new Error(
            "UniqueId argument to survey response constructer was not of expected type!"
        );
    return testCreateUniqueId;
}
