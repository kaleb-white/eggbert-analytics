import { describe, expect, test } from "bun:test";
import testPool from "./utilities/test_pool";
import { initializationStatements } from "@/persistent_storage/postgres_db/initialization/sql";

import { sampleSurvey } from "./utilities/sample_data";
import { executeStatements } from "@/persistent_storage/postgres_db/execution_utilities";
import {
    getSurveyWithoutResponses,
    saveOrUpdateSurvey,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/survey";
import { QueryResult } from "pg";
import { getFirstEntity } from "@/persistent_storage/postgres_db/generation_types_and_utilities";
import { Survey } from "@/core/entities/surveys/survey";

async function initialize() {
    for (const statement of Object.keys(initializationStatements)) {
        if (statement.includes("create")) {
            try {
                await testPool.query(initializationStatements[statement]);
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                await testPool.query(initializationStatements[statement]);
            } catch (e) {}
        }
    }
}

describe("test that survey is saved to database", async () => {
    // Initialize database
    await initialize();

    // Create sql from sample survey
    test("try execute survey save", async () => {
        const statements = saveOrUpdateSurvey(sampleSurvey);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });

    test("get survey without responses", async () => {
        const statements = getSurveyWithoutResponses(sampleSurvey.uniqueId);

        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);

        const surveyOrError = getFirstEntity<Survey>(result as QueryResult[]);
        expect(surveyOrError).not.toBeInstanceOf(Error);

        const survey = surveyOrError as Survey;
        expect(survey.uniqueId).toBe("sampleSurvey");
        expect(survey.questions[0].uniqueId).toBe("q1");
        expect(survey.questions[1].uniqueId).toBe("q2");
    });
});
