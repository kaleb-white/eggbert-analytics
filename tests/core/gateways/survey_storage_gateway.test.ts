import { describe, expect, test } from "bun:test";
import { sampleSurvey } from "@/tests/db/utilities/sample_data";
import { SurveyStorageGatewayImpl } from "@/core/gateways/internal/survey_storage_gateway_impl";
import { SurveyCacheImpl } from "@/core/gateways/external/survey_cpp_socket_cache_impl";
import { CacheGatewayImpl } from "@/persistent_storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { SurveyPostgresDbImpl } from "@/core/gateways/external/survey_postgres_db_impl";
import testPool from "@/tests/db/utilities/test_pool";
import { initialize } from "@/tests/db/utilities/reset_and_initialize";
import { Survey } from "@/core/entities/surveys/survey";

const cacheGateway = new CacheGatewayImpl();
const cache = new SurveyCacheImpl(cacheGateway);
const db = new SurveyPostgresDbImpl(testPool);
const surveyStorage = new SurveyStorageGatewayImpl(cache, db);

describe("test survey storage gateway", async () => {
    await initialize();

    test("test store survey", async () => {
        const storeResult = await surveyStorage.saveSurvey(sampleSurvey);
        expect(storeResult).toBeNull();

        const storedToCache = await cache.loadSurveyFromCache(
            sampleSurvey.uniqueId
        );

        expect(storedToCache).not.toBeInstanceOf(Error);
        expect((storedToCache as Survey).uniqueId).toBe(sampleSurvey.uniqueId);

        const storedToDb = await db.loadSurveyWithResponsesFromDb(
            sampleSurvey.uniqueId
        );

        expect(storedToDb).not.toBeInstanceOf(Error);
        expect((storedToDb as Survey).uniqueId).toBe(sampleSurvey.uniqueId);
    });
    describe("test retrieve survey", () => {});
});
