import { CryptographyUtilities } from "@entities/interfaces/crypto_utility_creator";

export function assignOrCreateUniqueId(
    uniqueId: string | CryptographyUtilities
): string {
    const testCreateUniqueId =
        typeof uniqueId === "string"
            ? (uniqueId as string)
            : (uniqueId as CryptographyUtilities).createUniqueId();
    return testCreateUniqueId;
}
