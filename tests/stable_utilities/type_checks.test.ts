import { CryptoUtilityCreator } from "@/entities/interfaces/crypto_utility_creator"
import { isCryptoUtilityCreator } from "@/stable_utilities/type_checks"
import { describe, expect, test } from "bun:test"

describe('test type checks', () => {
    describe('test crypto utility creator type check', () => {
        const facadeCryptoUtilityCreatorImpl: CryptoUtilityCreator = { createUniqueId() {
            return 'a'
        }}

        test('facade recognized as crypto utility creator', () => {
            expect(isCryptoUtilityCreator(facadeCryptoUtilityCreatorImpl)).toBeTrue()
        })

    })
})
