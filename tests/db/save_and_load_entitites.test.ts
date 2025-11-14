import { describe, expect, test } from "bun:test";
import { sampleSurvey } from "./utilities/sample_data";
import { executeStatements } from "@/storage/postgres_db/execution_utilities";
import {
    getSurveys,
    getSurveyWithoutResponses,
    saveSurveys,
} from "@/storage/postgres_db/sql_generators_by_entity/survey";
import { QueryResult } from "pg";
import {
    getAllEntities,
    getFirstEntity,
} from "@/storage/postgres_db/generation_types_and_utilities";
import { Survey } from "@/core/entities/surveys/survey";
import { getTurns } from "@/storage/postgres_db/sql_generators_by_entity/turns";
import { Turn } from "@/core/entities/surveys/turn";
import { getResponses } from "@/storage/postgres_db/sql_generators_by_entity/responses";
import { Response } from "@/core/entities/surveys/response";
import testPool from "./utilities/test_pool";
import { testInitializer } from "@/injections";
import {
    getSession,
    getSessions,
    saveSessions,
} from "@/storage/postgres_db/sql_generators_by_entity/sessions";
import {
    getUser,
    getUsers,
    saveUsers,
} from "@/storage/postgres_db/sql_generators_by_entity/users";
import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";
import { Respondent } from "@/core/entities/users/respondent";
import { Anonymous } from "@/core/entities/users/anonymous";
import { Author } from "@/core/entities/users/author";
import { Password } from "@/core/entities/users/password";
import {
    getPassword,
    getPasswords,
    savePasswords,
} from "@/storage/postgres_db/sql_generators_by_entity/passwords";

describe("test that survey is saved to database", async () => {
    // Initialize database
    await testInitializer.initialize();

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

describe("test that user, session, password is saved to database", async () => {
    // Initialize database
    await testInitializer.initialize();

    // Test entities
    const resp = new Respondent({ email: "a", uniqueId: "abc" });
    const anon = new Anonymous({ email: "b", uniqueId: "def" });
    const auth = new Author({ email: "c", uniqueId: "ghi" });

    const s1 = new Session({
        antiCsrfToken: "abc",
        role: "anonymous",
        uniqueId: "abc",
        userId: "abc",
    });
    const s2 = new Session({
        antiCsrfToken: "def",
        role: "author",
        uniqueId: "def",
        userId: "def",
    });
    const s3 = new Session({
        antiCsrfToken: "def",
        role: "respondent",
        uniqueId: "ghi",
        userId: "ghi",
    });

    const p1 = new Password({
        userId: "abc",
        salt: "def",
        hash: "ghi",
    });
    const p2 = new Password({
        userId: "def",
        salt: "def",
        hash: "ghi",
    });
    const p3 = new Password({
        userId: "ghi",
        salt: "def",
        hash: "ghi",
    });

    test("save no user", async () => {
        const statements = saveUsers([]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save one user", async () => {
        const statements = saveUsers([resp]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save two users", async () => {
        const statements = saveUsers([anon, auth]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });

    test("save no session", async () => {
        const statements = saveSessions([]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save one session", async () => {
        const statements = saveSessions([s1]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save two sessions", async () => {
        const statements = saveSessions([s2, s3]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });

    test("save no password", async () => {
        const statements = savePasswords([]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save one password", async () => {
        const statements = savePasswords([p1]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save two passwords", async () => {
        const statements = savePasswords([p2, p3]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });

    test("get no session", async () => {
        const statements = getSession("fake");
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("get one session", async () => {
        const statements = getSession("abc");
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
        const entities = getAllEntities<Session>(result as QueryResult[]);
        expect(entities).not.toBeInstanceOf(Error);
        expect(entities).not.toBeNull();
        const e = entities as Session[];
        expect(e.length).toBe(1);
        expect(e[0].uniqueId).toBe(s1.uniqueId);
        expect(e[0].expiration).toBe(s1.expiration);
    });
    test("get two sessions", async () => {
        const statements = getSessions([s2.uniqueId, s3.uniqueId]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
        const entities = getAllEntities<Session>(
            result as QueryResult[],
            "sessionsAgg"
        );
        expect(entities).not.toBeInstanceOf(Error);
        expect(entities).not.toBeNull();
        const e = entities as Session[];
        expect(e.length).toBe(2);
        expect(e[0].uniqueId).toBe(s2.uniqueId);
        expect(e[1].uniqueId).toBe(s3.uniqueId);
    });

    test("get no user", async () => {
        const statements = getUser("fake");
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("get one user", async () => {
        const statements = getUser(resp.uniqueId);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
        const entities = getAllEntities<Respondent>(result as QueryResult[]);
        expect(entities).not.toBeInstanceOf(Error);
        expect(entities).not.toBeNull();
        const e = entities as Respondent[];
        expect(e.length).toBe(1);
        expect(e[0].uniqueId).toBe(resp.uniqueId);
    });
    test("get two users", async () => {
        const statements = getUsers([anon.uniqueId, auth.uniqueId]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
        const entities = getAllEntities<User>(
            result as QueryResult[],
            "usersAgg"
        );
        expect(entities).not.toBeInstanceOf(Error);
        expect(entities).not.toBeNull();
        const e = entities as User[];
        expect(e.length).toBe(2);
        expect(e[0].uniqueId).toBe(anon.uniqueId);
        expect(e[1].uniqueId).toBe(auth.uniqueId);
    });

    test("get no password", async () => {
        const statements = getPassword("fake");
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("get one password", async () => {
        const statements = getPassword(resp.uniqueId);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
        const entities = getAllEntities<Password>(result as QueryResult[]);
        expect(entities).not.toBeInstanceOf(Error);
        expect(entities).not.toBeNull();
        const e = entities as Password[];
        expect(e.length).toBe(1);
        expect(e[0].userId).toBe(p1.userId);
        expect(e[0].salt).toBe(p1.salt);
    });
    test("get two passwords", async () => {
        const statements = getPasswords([anon.uniqueId, auth.uniqueId]);
        const result = await executeStatements(statements, testPool);
        expect(result).not.toBeInstanceOf(Error);
        const entities = getAllEntities<Password>(
            result as QueryResult[],
            "passwordsAgg"
        );
        expect(entities).not.toBeInstanceOf(Error);
        expect(entities).not.toBeNull();
        const e = entities as Password[];
        expect(e.length).toBe(2);
        expect(e[0].userId).toBe(p2.userId);
        expect(e[0].hash).toBe(p2.hash);
        expect(e[1].userId).toBe(p3.userId);
    });
});
