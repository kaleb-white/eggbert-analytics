import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";
import { sessionController, storage, testInitializer } from "@/injections";
import { describe, expect, test } from "bun:test";

describe("test session controller", async () => {
    await testInitializer.initialize();
    const u = new User({
        email: "email",
        lastLogin: Date.now(),
        role: "anonymous",
        timeCreated: Date.now(),
        uniqueId: "user",
    });
    await storage.save(u.uniqueId, u);
    const s1 = new Session({ userId: "user", uniqueId: "1" });
    const s2 = new Session({ userId: "user", uniqueId: "2" });
    const s3 = new Session({ userId: "user", uniqueId: "3" });
    describe.serial("test create and save session", async () => {
        const s = await sessionController.createAndSaveSession(u);
        expect(s).not.toBeInstanceOf(Error);

        const session = s as Session;
        expect(session.role).toBe("anonymous");
        expect(session.userId).toBe("user");

        const sFromDb = await storage.get(session.uniqueId, new Session());
        expect(sFromDb).not.toBeInstanceOf(Error);
        expect((sFromDb as Session).uniqueId).toBe(session.uniqueId);
    });
    describe.serial("test get sessions", async () => {
        test("test get no session", async () => {
            const getResult = await sessionController.getSessions(u);
            expect(getResult).not.toBeInstanceOf(Error);
            expect((getResult as Array<Session>).length).toBe(1);
        });
        test("test get one session", async () => {
            const saveResult = await storage.save(s1.uniqueId, s1);
            expect(saveResult).not.toBeInstanceOf(Error);

            const getResult = await sessionController.getSessions(u);
            expect(getResult).not.toBeInstanceOf(Error);
            const ids = (getResult as Array<Session>).map((s) => s.uniqueId);
            expect(ids.includes(s1.uniqueId)).toBeTrue();
        });
        test("test get all sessions", async () => {
            let saveResult = await storage.save(s2.uniqueId, s2);
            expect(saveResult).not.toBeInstanceOf(Error);
            saveResult = await storage.save(s3.uniqueId, s3);
            expect(saveResult).not.toBeInstanceOf(Error);

            const getResult = await sessionController.getSessions(u);
            expect(getResult).not.toBeInstanceOf(Error);
            const ids = (getResult as Array<Session>).map((s) => s.uniqueId);
            expect(ids.includes(s2.uniqueId)).toBeTrue();
            expect(ids.includes(s3.uniqueId)).toBeTrue();
        });
    });
    describe.serial("test check session valid", async () => {
        test("test expired", async () => {
            const badSession = sessionController.createSessionEntity(u);
            badSession.expiration = Date.UTC(2000);
            const saveResult = await storage.save(
                badSession.uniqueId,
                badSession
            );
            expect(saveResult).not.toBeInstanceOf(Error);

            expect(
                await sessionController.checkSessionValid(badSession)
            ).toBeFalse();
        });
        test("test valid", async () => {
            expect(await sessionController.checkSessionValid(s1)).toBeTrue();
        });
    });
    describe("test update session", async () => {
        test("test should update expiration", async () => {
            const needsUpdate = sessionController.createSessionEntity(u);
            const twentyDaysFuture = Date.now() + 1000 * 60 * 60 * 24 * 20;
            needsUpdate.expiration = twentyDaysFuture;

            const updateResult = await sessionController.updateSession(
                needsUpdate
            );
            expect(updateResult).not.toBeInstanceOf(Error);

            const s = await storage.get(needsUpdate.uniqueId, new Session());
            expect(s).not.toBeInstanceOf(Error);
            expect(s).not.toBeNull();

            const thirtyDays = Date.now() + 1000 * 60 * 60 * 24 * 30;
            const thirtyDaysOneMinute = thirtyDays + 60 * 1000;
            const thirtyDaysMinusOneMinute = thirtyDays - 60 * 1000;
            expect((s as Session).expiration).toBeGreaterThanOrEqual(
                thirtyDaysMinusOneMinute
            );
            expect((s as Session).expiration).toBeLessThanOrEqual(
                thirtyDaysOneMinute
            );
        });
        test("test should not update expiration", async () => {
            const noUpdate = sessionController.createSessionEntity(u);
            const fiveDaysFuture = Date.now() + 1000 * 60 * 60 * 24 * 5;
            noUpdate.expiration = fiveDaysFuture;

            const updateResult = await sessionController.updateSession(
                noUpdate
            );
            expect(updateResult).not.toBeInstanceOf(Error);

            const s = await storage.get(noUpdate.uniqueId, new Session());
            expect(s).not.toBeInstanceOf(Error);
            expect(s).not.toBeNull();

            expect((s as Session).expiration).toBe(noUpdate.expiration);
        });
    });
});
