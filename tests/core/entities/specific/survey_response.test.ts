import { Question } from "@/core/entities/surveys/question";
import { questionResponse } from "@/core/entities/surveys/question_response";
import { Turn } from "@/core/entities/surveys/turn";
import { describe, expect, test } from "bun:test";

describe("test survey response", () => {
    describe("method dialogueAsString", () => {
        const testPrompt = new Question("test");
        const turns = [new Turn(), new Turn()];
        const t = new questionResponse("ex", testPrompt, turns);

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
