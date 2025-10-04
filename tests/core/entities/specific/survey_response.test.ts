import { Question } from "@entities/surveys/question";
import { QuestionResponse } from "@entities/surveys/question_response";
import { Turn } from "@entities/surveys/turn";
import { describe, expect, test } from "bun:test";

describe("test survey response", () => {
    describe("method dialogueAsString", () => {
        const testPrompt = new Question("test");
        const turns = [new Turn(), new Turn()];
        const t = new QuestionResponse("ex", testPrompt, turns);

        test("outputs nothing when turns are empty", () => {
            expect(t.dialogueAsString).toBe("");
        });

        test("output first turn when only first turn exists", () => {
            t.transcript = [new Turn("testModelOutput", "testUserAnswer")];
            expect(t.dialogueAsString).toBe(
                "the model asked: testModelOutput \nthe user responded: testUserAnswer"
            );
        });
    });
});
