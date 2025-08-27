import { ModelDialoguePrompt } from "@/entities/surveys/model_dialogue_prompt";
import { Transcript } from "@/entities/surveys/transcript";
import { Turn } from "@/entities/surveys/turn";
import { describe, expect, test } from "bun:test";

describe("test transcript",  () => {

    describe("test method dialogueAsString", () => {
        const testPrompt = new ModelDialoguePrompt("test")
        const turns = [new Turn(testPrompt), new Turn(testPrompt)]
        const t = new Transcript(new Turn(testPrompt), turns)

        test("outputs nothing when turns are empty", () => {
            expect(t.dialogueAsString).toBe("")
        })

        test("output first turn when only first turn exists", () => {
            t.setFirstTurn = new Turn(testPrompt, "testModelOutput", "testUserAnswer")
            expect(t.dialogueAsString).toBe("the model asked: testModelOutput \nthe user responded: testUserAnswer")
        })
    })

})
