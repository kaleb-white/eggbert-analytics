import { describe, expect, test } from "bun:test";
import { sampleSurvey } from "@/tests/db/utilities/sample_data";
import { StorageGatewayImpl } from "@/core/gateways/internal/storage_gateway_impl";
import { CacheImpl } from "@/core/gateways/external/cpp_socket_cache_impl";
import { CacheGatewayImpl } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { PostgresDbImpl } from "@/core/gateways/external/postgres_db_impl";
import { Survey } from "@/core/entities/surveys/survey";
import testPool from "@/tests/db/utilities/test_pool";
import { testInitializer } from "@/injections";
import { User } from "@/core/entities/users/user";
import { Session } from "@/core/entities/users/session";

const cacheGateway = new CacheGatewayImpl();
const cache = new CacheImpl(cacheGateway);
const db = new PostgresDbImpl(testPool);
const storage = new StorageGatewayImpl(cache, db);

describe.serial("test storage gateway", async () => {
    await testInitializer.removeAllRows();

    test.serial("test store survey", async () => {
        const storeResult = await storage.save(
            sampleSurvey.uniqueId,
            sampleSurvey
        );
        expect(storeResult).toBeNull();

        // Catch sys error when cache not running
        // If cache is running error is not thrown but bounced up so don't worry about caching unexpected error
        try {
            const storedToCache = await cache.get(sampleSurvey.uniqueId);
            expect(storedToCache).not.toBeInstanceOf(Error);
            expect((storedToCache as Survey).uniqueId).toBe(
                sampleSurvey.uniqueId
            );
        } catch {}

        const storedToDb = await db.get(sampleSurvey.uniqueId, new Survey());

        expect(storedToDb).not.toBeInstanceOf(Error);
        expect(storedToDb).not.toBeNull();
        expect((storedToDb as Survey).uniqueId).toBe(sampleSurvey.uniqueId);
    });

    test.serial("test retrieve survey with responses", async () => {
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

const u = new User({ uniqueId: "user", email: "userEmail" });
const s1 = new Session({ userId: "user", uniqueId: "1" });
const s2 = new Session({ userId: "user", uniqueId: "2" });
const s3 = new Session({ userId: "user", uniqueId: "3" });

describe.serial("test storage gateway get all", async () => {
    await testInitializer.removeAllRows();

    test.serial("test save user", async () => {
        const saveResult = await storage.save(u.uniqueId, u);
        expect(saveResult).not.toBeInstanceOf(Error);
    });

    test.serial("test get user", async () => {
        const getResultUser = await storage.get(u.uniqueId, new User());
        expect(getResultUser).not.toBeInstanceOf(Error);
        expect(getResultUser).not.toBeNull();
        expect((getResultUser as User).uniqueId).toBe("user");
    });

    test.serial("test getAll no result", async () => {
        const getResult = await storage.getAll(
            u.uniqueId,
            new Session(),
            "userId"
        );
        expect(getResult).toBeNull();
    });

    test.serial("test save one session", async () => {
        const saveResult = await storage.save(s1.uniqueId, s1);
        expect(saveResult).not.toBeInstanceOf(Error);
    });

    test.serial("test get one session", async () => {
        const getResultSession = await storage.get(s1.uniqueId, new Session());
        expect(getResultSession).not.toBeInstanceOf(Error);
        expect(getResultSession).not.toBeNull();
        expect((getResultSession as Session).uniqueId).toBe("1");
    });

    test.serial("test getAll one result", async () => {
        const getResult = await storage.getAll(
            u.uniqueId,
            new Session(),
            "userId"
        );
        expect(getResult).not.toBeInstanceOf(Error);
        expect(getResult).not.toBeNull();
        expect(getResult).toBeArrayOfSize(1);
        expect((getResult as Session[])[0].uniqueId).toBe("1");
    });

    test.serial("test save two sessions", async () => {
        let saveResult = await storage.save(s2.uniqueId, s2);
        expect(saveResult).not.toBeInstanceOf(Error);

        saveResult = await storage.save(s3.uniqueId, s3);
        expect(saveResult).not.toBeInstanceOf(Error);
    });

    test.serial("test get two sessions", async () => {
        let getResultSession = await storage.get(s2.uniqueId, new Session());
        expect(getResultSession).not.toBeInstanceOf(Error);
        expect(getResultSession).not.toBeNull();
        expect((getResultSession as Session).uniqueId).toBe("2");

        getResultSession = await storage.get(s3.uniqueId, new Session());
        expect(getResultSession).not.toBeInstanceOf(Error);
        expect(getResultSession).not.toBeNull();
        expect((getResultSession as Session).uniqueId).toBe("3");
    });

    test.serial("test getAll all results", async () => {
        const getResult = await storage.getAll(
            u.uniqueId,
            new Session(),
            "userId"
        );
        expect(getResult).not.toBeInstanceOf(Error);
        expect(getResult).not.toBeNull();
        expect(getResult).toBeArrayOfSize(3);
        const expectedIds = ["1", "2", "3"];
        (getResult as Session[]).map((s) => {
            expect(expectedIds.includes(s.uniqueId)).toBeTrue();
        });
    });
});

describe.serial("test storage gateway delete", async () => {
    test.serial("delete nonexistent", async () => {
        const deleteResult = await storage.delete("user2", new User());
        expect(deleteResult).toBeNull();
    });

    test.serial("delete one session", async () => {
        const deleteResult = await storage.delete("1", new Session());
        expect(deleteResult).toBeArray();
        expect((deleteResult as string[]).length).toBe(1);
        expect((deleteResult as string[])[0]).toBe("1");
    });
    test.serial("delete two sessions", async () => {
        const deleteResult = await storage.delete(["2", "3"], new Session());
        expect(deleteResult).toBeArray();
        expect((deleteResult as string[]).length).toBe(2);
        expect((deleteResult as string[]).includes("2")).toBeTrue();
        expect((deleteResult as string[]).includes("3")).toBeTrue();
    });
    test.serial("delete one user", async () => {
        const deleteResult = await storage.delete("user", new User());
        expect(deleteResult).toBeArray();
        expect((deleteResult as string[]).length).toBe(1);
        expect((deleteResult as string[])[0]).toBe("user");
    });
    test.serial("get user after delete", async () => {
        const getResult = await storage.get("user", new User());
        expect(getResult).toBeNull();
    });
});
