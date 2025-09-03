import { CryptographyUtilities } from "@/core/entities/interfaces/crypto_utility_creator";
import { ModelDialoguePrompt } from "@/core/entities/surveys/model_dialogue_prompt";
import { Survey } from "@/core/entities/surveys/survey";
import { SurveyResponse } from "@/core/entities/surveys/survey_response";
import {
    isCryptographyUtilities,
    isSurvey,
} from "@/stable_utilities/type_checks";
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

    describe("test survey type check", () => {
        const fakeSurvey = new Survey([], "", []);
        const fakeSurvey2 = new Survey(
            [new ModelDialoguePrompt("")],
            "abcbca",
            [new SurveyResponse([], "abcbca")]
        );

        test("facade recognized as survey", () => {
            expect(isSurvey(fakeSurvey)).toBeTrue();
        });

        test("survey with some properties recognized as survey", () => {
            expect(isSurvey(fakeSurvey2)).toBeTrue();
        });
    });
});
