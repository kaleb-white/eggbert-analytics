import { describe, expect, test } from "bun:test";
import {
    respondent1,
    respondent2,
    sampleSurvey,
} from "../../storage/postgres_db/initialization/sample_data";
import { Survey } from "@/core/entities/surveys/survey";
import { Author } from "@/core/entities/users/author";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { storage, testInitializer } from "@/injections";

describe("test test initializer", () => {
    test.serial("initialize should not error", async () => {
        const results = await testInitializer.initialize();
        expect(results).toBeNull();
    });

    test.serial(
        "truncate should not error and should remove rows",
        async () => {
            const saveResultResp1 = await storage.save(
                respondent1.uniqueId,
                respondent1,
                true
            );
            const saveResultResp2 = await storage.save(
                respondent2.uniqueId,
                respondent2,
                true
            );
            expect(saveResultResp1).not.toBeInstanceOf(Error);
            expect(saveResultResp2).not.toBeInstanceOf(Error);

            const foreignKey = sampleSurvey.author;
            const child = sampleSurvey.responses[0];
            const subchild = child.questionResponses[0];
            const saveResult = await storage.save(
                sampleSurvey.uniqueId,
                sampleSurvey,
                true
            );
            expect(saveResult).not.toBeInstanceOf(Error);

            const truncateResult = await testInitializer.removeAllRows();
            expect(truncateResult).not.toBeInstanceOf(Error);

            const isSurveyStillSaved = await storage.get(
                sampleSurvey.uniqueId,
                new Survey(),
                "uniqueId",
                true
            );
            expect(isSurveyStillSaved).toBeNull();

            const isForeignKeyStillSaved = await storage.get(
                foreignKey.uniqueId,
                new Author(),
                "uniqueId",
                true
            );
            expect(isForeignKeyStillSaved).toBeNull();

            const isChildSaved = await storage.get(
                child.uniqueId,
                new Response(),
                "uniqueId",
                true
            );
            expect(isChildSaved).toBeNull();

            const isSubChildSaved = await storage.get(
                subchild.uniqueId,
                new QuestionResponse(),
                "uniqueId",
                true
            );
            expect(isSubChildSaved).toBeNull();
        }
    );

    test.serial("test reset and save sample data", async () => {
        const resetResult = await testInitializer.resetWithSampleSurvey();
        expect(resetResult).not.toBeArray();

        const isSurveySaved = await storage.get(
            sampleSurvey.uniqueId,
            new Survey(),
            "uniqueId",
            true
        );
        expect(isSurveySaved).not.toBeInstanceOf(Error);
        expect(isSurveySaved).not.toBeNull();

        const survey = isSurveySaved as Survey;
        expect(sampleSurvey.uniqueId).toBe(survey.uniqueId);
        expect(sampleSurvey.responses.length).toBe(survey.responses.length);
    });
});
