import { describe, expect, test } from "bun:test";
import testPool from "./utilities/test_pool";

import { sampleSurvey } from "./utilities/sample_data";
import { executeStatements } from "@/persistent_storage/postgres_db/execution_utilities";
import {
    getSurveys,
    getSurveyWithoutResponses,
    saveSurveys,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/survey";
import { QueryResult } from "pg";
import {
    getAllEntities,
    getFirstEntity,
} from "@/persistent_storage/postgres_db/generation_types_and_utilities";
import { Survey } from "@/core/entities/surveys/survey";
import { getTurns } from "@/persistent_storage/postgres_db/sql_generators_by_entity/turns";
import { Turn } from "@/core/entities/surveys/turn";
import { getResponses } from "@/persistent_storage/postgres_db/sql_generators_by_entity/responses";
import { Response } from "@/core/entities/surveys/response";
import { initialize } from "./utilities/reset_and_initialize";

describe("test that survey is saved to database", async () => {
    // Initialize database
    await initialize();

    // Create sql from sample survey
    test("try execute survey save", async () => {
        const statements = saveSurveys([sampleSurvey]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });

    test("get survey without responses", async () => {
        const statements = getSurveyWithoutResponses(sampleSurvey.uniqueId);

        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);

        const surveyOrError = getFirstEntity<Survey>(
            result as QueryResult[],
            "surveyagg"
        );
        expect(surveyOrError).not.toBeInstanceOf(Error);

        const survey = surveyOrError as Survey;

        expect(survey.uniqueId).toBe("sampleSurvey");
        expect(survey.questions[0].uniqueId).toBe("q1");
        expect(survey.questions[1].uniqueId).toBe("q2");
    });

    test("get turns", async () => {
        const statements = getTurns(["q1t1", "q1t2"]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);

        const shouldBeError = getAllEntities<Turn>(
            result as QueryResult[],
            "notturnsagg"
        );
        expect(shouldBeError).toBeInstanceOf(Error);

        const entitiesOrError = getAllEntities<Turn>(
            result as QueryResult[],
            "turnsagg"
        );
        expect(entitiesOrError).not.toBeInstanceOf(Error);

        const entities = entitiesOrError as Turn[];

        expect(entities.length).toBe(2);
        expect(entities[0].uniqueId).toBe("q1t1");
        expect(entities[1].uniqueId).toBe("q1t2");
    });

    test("get responses", async () => {
        const statements = getResponses(["r1", "r2"]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);

        const entitiesOrError = getAllEntities<Response>(
            result as QueryResult[],
            "responsesagg"
        );
        expect(entitiesOrError).not.toBeInstanceOf(Error);

        const entities = entitiesOrError as Response[];
        expect(entities.length).toBe(2);
        expect(entities[0].uniqueId).toBe("r1");
        expect(entities[1].uniqueId).toBe("r2");

        const qrs = entities[0].questionResponses;
        expect(qrs.length).toBe(2);
        expect(qrs[0].uniqueId).toBe("qr1");

        const trns = qrs[0].transcript;
        expect(trns.length).toBe(2);
        expect(trns[0].uniqueId).toBe("q1t1");
    });

    test("get surveys", async () => {
        const statements = getSurveys(["sampleSurvey"]);

        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);

        const entitiesOrError = getAllEntities<Survey>(
            result as QueryResult[],
            "surveysAgg"
        );
        expect(entitiesOrError).not.toBeInstanceOf(Error);

        const entities = entitiesOrError as Survey[];
        expect(entities.length).toBe(1);
    });
});
