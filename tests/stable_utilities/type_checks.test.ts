import { CryptographyUtilities } from "@/core/entities/interfaces/crypto_utility_creator";
import { isCryptographyUtilities } from "@/stable_utilities/type_checks";
import { describe, expect, test } from "bun:test";

describe("test type checks", () => {
    describe("test crypto utility creator type check", () => {
        const facadeCryptographyUtilitiesImpl: CryptographyUtilities = {
            createUniqueId() {
                return "a";
            },
        };

        test("facade recognized as crypto utility creator", () => {
            expect(
                isCryptographyUtilities(facadeCryptographyUtilitiesImpl)
            ).toBeTrue();
        });
    });
});
