import { ModelDialoguePrompt } from "@/core/entities/surveys/model_dialogue_prompt";
import { SurveyResponse } from "@/core/entities/surveys/survey_response";
import { Turn } from "@/core/entities/surveys/turn";
import { describe, expect, test } from "bun:test";

describe("test survey response", () => {
  describe("test method dialogueAsString", () => {
    const testPrompt = new ModelDialoguePrompt("test");
    const turns = [new Turn(), new Turn()];
    const t = new SurveyResponse([testPrompt], "ex", turns);

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
