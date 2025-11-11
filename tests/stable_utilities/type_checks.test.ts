import { CryptographyUtilities } from "@/core/controllers/crypto/interfaces/crypto_utility_creator";
import { Question } from "@entities/surveys/question";
import { Survey } from "@entities/surveys/survey";
import { Response } from "@entities/surveys/response";
import { isCryptographyUtilities, isSurvey } from "@/utilities/type_checks";
import { describe, expect, test } from "bun:test";
import { Author } from "@/core/entities/users/author";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Turn } from "@/core/entities/surveys/turn";
import { User } from "@/core/entities/users/user";
import { Respondent } from "@/core/entities/users/respondent";
import { isT } from "@/utilities/global_type_check";

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
        const fakeSurvey = new Survey({ author: new Author("abc") });
        const fakeSurvey2 = new Survey({
            uniqueId: "abcbca",
            questions: [new Question()],
            responses: [new Response()],
            author: new Author("abc"),
        });

        test("facade recognized as survey", () => {
            expect(isSurvey(fakeSurvey)).toBeTrue();
        });

        test("survey with some properties recognized as survey", () => {
            expect(isSurvey(fakeSurvey2)).toBeTrue();
        });
    });
});

const t = new Turn({ uniqueId: "test" });
const twv = new Turn({
    uniqueId: "test",
    lastEdited: Date.now(),
    modelMessage: "modelMessage",
    respondentMessage: "respMessage",
    timeCreated: Date.now(),
});

const q = new Question({ uniqueId: "test" });
const qwv = new Question({
    uniqueId: "test",
    question: "question",
    lastEdited: Date.now(),
    maxNumberOfTurns: 3,
    modelPrompt: "prompt",
    timeCreated: Date.now(),
});

const qr = new QuestionResponse({ uniqueId: "test" });
const qrwv = new QuestionResponse({
    uniqueId: "test",
    currentTurn: 3,
    lastEdited: Date.now(),
    question: qwv,
    summary: "summ",
    timeCreated: Date.now(),
    transcript: [twv, twv],
});

const rd = new Respondent("test");

const r = new Response({ uniqueId: "test" });
const rwv = new Response({
    uniqueId: "test",
    lastEdited: Date.now(),
    questionResponses: [qrwv, qrwv],
    respondent: rd,
    timeCreated: Date.now(),
});

const u = new User("test");
const a = new Author("test");

const s = new Survey({ uniqueId: "test" });
const swv = new Survey({
    author: a,
    lastEdited: Date.now(),
    questions: [qwv, qwv],
    responses: [rwv, rwv],
    timeCreated: Date.now(),
    uniqueId: "test",
});

describe("test isT", () => {
    describe("test isSurvey", () => {
        test("simple", () => {
            expect(isT(s, new Survey())).toBeTrue();
        });
        test("with children", () => {
            expect(isT(swv, new Survey())).toBeTrue();
        });
    });
    describe("test isResponse", () => {
        test("simple", () => {
            expect(isT(r, new Response())).toBeTrue();
        });
        test("with values", () => {
            expect(isT(rwv, new Response())).toBeTrue();
        });
    });
    describe("test isQuestionResponse", () => {
        test("simple", () => {
            expect(isT(qr, new QuestionResponse())).toBeTrue();
        });
        test("with values", () => {
            expect(isT(qrwv, new QuestionResponse())).toBeTrue();
        });
    });
    describe("test isQuestion", () => {
        test("simple", () => {
            expect(isT(q, new Question())).toBeTrue();
        });
        test("with values", () => {
            expect(isT(qwv, new Question())).toBeTrue();
        });
    });
    describe("test isTurn", () => {
        test("simple", () => {
            expect(isT(t, new Turn())).toBeTrue();
        });
        test("with values", () => {
            expect(isT(twv, new Turn())).toBeTrue();
        });
    });
    describe("test isUser", () => {
        test("simple", () => {
            expect(isT(u, new User())).toBeTrue();
        });
    });
    describe("test isRespondent", () => {
        test("simple", () => {
            expect(isT(rd, new Respondent())).toBeTrue();
        });
    });
    describe("test isAuthor", () => {
        test("simple", () => {
            expect(isT(a, new Author())).toBeTrue();
        });
    });
});
