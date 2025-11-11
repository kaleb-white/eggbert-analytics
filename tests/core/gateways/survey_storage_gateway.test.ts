import { describe, expect, test } from "bun:test";
import { sampleSurvey } from "@/tests/db/utilities/sample_data";
import { StorageGatewayImpl } from "@/core/gateways/internal/storage_gateway_impl";
import { CacheImpl } from "@/core/gateways/external/cpp_socket_cache_impl";
import { CacheGatewayImpl } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { PostgresDbImpl } from "@/core/gateways/external/postgres_db_impl";
import { Survey } from "@/core/entities/surveys/survey";
import testPool from "@/tests/db/utilities/test_pool";
import { testInitializer } from "@/injections";

const cacheGateway = new CacheGatewayImpl();
const cache = new CacheImpl(cacheGateway);
const db = new PostgresDbImpl(testPool);
const storage = new StorageGatewayImpl(cache, db);

describe("test survey storage gateway", async () => {
    await testInitializer.initialize();

    test("test store survey", async () => {
        const storeResult = await storage.save(
            sampleSurvey.uniqueId,
            sampleSurvey
        );
        expect(storeResult).toBeNull();

        const storedToCache = await cache.get(sampleSurvey.uniqueId);

        expect(storedToCache).not.toBeInstanceOf(Error);
        expect((storedToCache as Survey).uniqueId).toBe(sampleSurvey.uniqueId);

        const storedToDb = await db.get(sampleSurvey.uniqueId, new Survey());

        expect(storedToDb).not.toBeInstanceOf(Error);
        expect(storedToDb).not.toBeNull();
        expect((storedToDb as Survey).uniqueId).toBe(sampleSurvey.uniqueId);
    });

    test("test retrieve survey with responses", async () => {
        const retrievedSurveyOrError = await storage.get<Survey>(
            sampleSurvey.uniqueId,
            sampleSurvey
        );
        expect(retrievedSurveyOrError).not.toBeInstanceOf(Error);

        const retrievedSurvey = retrievedSurveyOrError as Survey;
        expect(retrievedSurvey.uniqueId).toBe(retrievedSurvey.uniqueId);
        expect(retrievedSurvey.responses.length).toBe(2);
    });
});
