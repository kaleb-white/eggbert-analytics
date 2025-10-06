import { CryptographyUtilities } from "@entities/interfaces/crypto_utility_creator";
import { Question } from "@entities/surveys/question";
import { Survey } from "@entities/surveys/survey";
import { Response } from "@entities/surveys/response";
import {
    isCryptographyUtilities,
    isSurvey,
} from "@/stable_utilities/type_checks";
import { describe, expect, test } from "bun:test";
import { Author } from "@/core/entities/users/author";

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

    describe("test survey type check", () => {
        const fakeSurvey = new Survey("", [], [], new Author("abc"));
        const fakeSurvey2 = new Survey(
            "abcbca",
            [new Question("")],
            [new Response("")],
            new Author("abc")
        );

        test("facade recognized as survey", () => {
            expect(isSurvey(fakeSurvey)).toBeTrue();
        });

        test("survey with some properties recognized as survey", () => {
            expect(isSurvey(fakeSurvey2)).toBeTrue();
        });
    });
});
