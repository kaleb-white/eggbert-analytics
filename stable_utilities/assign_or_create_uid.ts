import { CryptoUtilityCreator } from "@/entities/interfaces/crypto_utility_creator"
import { isCryptoUtilityCreator } from "./type_checks"

export function assignOrCreateUniqueId(uniqueId: string | CryptoUtilityCreator): string {
        const testCreateUniqueId = typeof(uniqueId) === 'string' ? uniqueId as string
            : isCryptoUtilityCreator(uniqueId) ? (uniqueId as CryptoUtilityCreator).createUniqueId()
            : "fail"
        if (testCreateUniqueId === "fail") throw new Error('UniqueId argument to survey response constructer was not of expected type!')
        return testCreateUniqueId
    }
