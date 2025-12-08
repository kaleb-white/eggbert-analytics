import { storage, userController } from "@/injections";
import { describe, expect, test } from "bun:test";
import * as argon2 from "argon2";
import { User } from "@/core/entities/users/user";
import { Session } from "@/core/entities/users/session";
import { Password } from "@/core/entities/users/password";
import { Response } from "@/core/entities/surveys/response";
import { sampleSurvey } from "@/storage/postgres_db/initialization/sample_data";

// Note: the UserController depends on the StorageGateway, so it is assumed that the storage gateway is working - in the sense that it is reporting errors properly or returning results.

async function checkPassword(digest: string, pass: string): Promise<boolean> {
    if (!process.env.PEPPER) throw Error("No pepper found as env variable");
    return await argon2.verify(digest, pass, {
        secret: Buffer.from(process.env.PEPPER),
    });
}

describe("test user controller", () => {
    test("hash no password", async () => {
        const pass = "";
        const hashResult = await userController.hashPassword(pass);
        expect(hashResult).not.toBeInstanceOf(Error);
    });
    test("hash one password", async () => {
        const pass = "myPass123";
        const hashResult1 = await userController.hashPassword(pass);
        const hashResult2 = await userController.hashPassword(pass);

        expect(hashResult1).not.toBeInstanceOf(Error);
        expect(hashResult2).not.toBeInstanceOf(Error);

        expect(await checkPassword(hashResult1 as string, pass)).toBeTrue();
        expect(await checkPassword(hashResult2 as string, pass)).toBeTrue();
    });
    test("hash two passwords", async () => {
        if (!process.env.PEPPER) throw Error("No pepper found as env variable");
        const pass1 = "myPass1234";
        const pass2 = "yourPass1234";

        const hashResult1 = await userController.hashPassword(pass1);
        const hashResult2 = await userController.hashPassword(pass2);

        expect(hashResult1).not.toBeInstanceOf(Error);
        expect(hashResult2).not.toBeInstanceOf(Error);

        expect(await checkPassword(hashResult1 as string, pass1)).toBeTrue();
        expect(await checkPassword(hashResult2 as string, pass2)).toBeTrue();

        expect(await checkPassword(hashResult1 as string, pass2)).toBeFalse();
        expect(await checkPassword(hashResult2 as string, pass1)).toBeFalse();
    });

    const u1 = new User({ uniqueId: "a", email: "bcd", role: "anonymous" });
    const u2 = new User({ uniqueId: "b", email: "cde", role: "author" });
    const u3 = new User({ uniqueId: "c", email: "def", role: "respondent" });

    const u1pass = "myPass1";
    const u2pass = "myPass2";
    const u3pass = "myPass3";

    const s1 = new Session({ uniqueId: "d", userId: "a" });

    test("save one user", async () => {
        const result = await userController.createOrUpdateUser(u1, u1pass);
        expect(result).not.toBeInstanceOf(Error);
    });
    test("save two users", async () => {
        const res1 = await userController.createOrUpdateUser(u2, u2pass);
        expect(res1).not.toBeInstanceOf(Error);
        const res2 = await userController.createOrUpdateUser(u3, u3pass);
        expect(res2).not.toBeInstanceOf(Error);
    });
    test("save duplicate user with modified field", async () => {
        u2.email = "edc";
        const res1 = await userController.createOrUpdateUser(u2, u2pass);
        expect(res1).not.toBeInstanceOf(Error);
        u2.email = "cde";
        const res2 = await userController.createOrUpdateUser(u2, u2pass);
        expect(res2).not.toBeInstanceOf(Error);
    });
    test("get no user", async () => {
        const result = await userController.getUser("fake");
        expect(result).toBeNull();
    });
    test("get one user", async () => {
        const result = await userController.getUser(u1.uniqueId);
        expect(result).not.toBeInstanceOf(Error);
        expect(result).not.toBeNull();
        expect((result as User).email).toBe(u1.email);
    });
    test("get two users", async () => {
        const res1 = await userController.getUser(u2.uniqueId);
        expect(res1).not.toBeInstanceOf(Error);
        expect(res1).not.toBeNull();
        expect((res1 as User).email).toBe(u2.email);

        const res2 = await userController.getUser(u3.uniqueId);
        expect(res2).not.toBeInstanceOf(Error);
        expect(res2).not.toBeNull();
        expect((res2 as User).email).toBe(u3.email);
    });
    test("get user by session", async () => {
        const result = await userController.getUser(s1);
        expect(result).not.toBeInstanceOf(Error);
        expect(result).not.toBeNull();
        expect((result as User).email).toBe(u1.email);
    });
    test("get no user by email", async () => {
        const result = await userController.getUserByEmail("fake");
        expect(result).toBeNull();
    });
    test("get one user by email", async () => {
        const result = await userController.getUserByEmail(u1.email);
        expect(result).not.toBeInstanceOf(Error);
        expect(result).not.toBeNull();
        expect((result as User).uniqueId).toBe(u1.uniqueId);
    });
    test("get two users by email", async () => {
        const res1 = await userController.getUserByEmail(u2.email);
        expect(res1).not.toBeInstanceOf(Error);
        expect(res1).not.toBeNull();
        expect((res1 as User).uniqueId).toBe(u2.uniqueId);

        const res2 = await userController.getUserByEmail(u3.email);
        expect(res2).not.toBeInstanceOf(Error);
        expect(res2).not.toBeNull();
        expect((res2 as User).uniqueId).toBe(u3.uniqueId);
    });
    test("get no password", async () => {
        const result = await userController.getPassword("fake");
        expect(result).toBeNull();
    });
    test("get one password", async () => {
        const result = await userController.getPassword(u1.uniqueId);
        expect(result).not.toBeInstanceOf(Error);
        expect(result).not.toBeNull();
        expect((result as Password).userId).toBe(u1.uniqueId);
    });
    test("get two passwords", async () => {
        const res1 = await userController.getPassword(u2.uniqueId);
        expect(res1).not.toBeInstanceOf(Error);
        expect(res1).not.toBeNull();
        expect((res1 as Password).userId).toBe(u2.uniqueId);

        const res2 = await userController.getPassword(u3.uniqueId);
        expect(res2).not.toBeInstanceOf(Error);
        expect(res2).not.toBeNull();
        expect((res2 as Password).userId).toBe(u3.uniqueId);
    });
    test("get no user and pass by email", async () => {
        const result = await userController.getUserAndPasswordByEmail("fake");
        expect(result).toBeNull();
    });
    test("get one user and password by email", async () => {
        const result = await userController.getUserAndPasswordByEmail(u1.email);
        expect(result).not.toBeInstanceOf(Error);
        expect(result).not.toBeNull();
        const [user, password] = result as [User, Password];
        expect(user.uniqueId).toBe(u1.uniqueId);
        expect(password.userId).toBe(u1.uniqueId);
    });
    test("get two user and passwords by email", async () => {
        const res1 = await userController.getUserAndPasswordByEmail(u2.email);
        expect(res1).not.toBeInstanceOf(Error);
        expect(res1).not.toBeNull();
        const [user1, password1] = res1 as [User, Password];
        expect(user1.uniqueId).toBe(u2.uniqueId);
        expect(password1.userId).toBe(u2.uniqueId);

        const res2 = await userController.getUserAndPasswordByEmail(u3.email);
        expect(res2).not.toBeInstanceOf(Error);
        expect(res2).not.toBeNull();
        const [user2, password2] = res2 as [User, Password];
        expect(user2.uniqueId).toBe(u3.uniqueId);
        expect(password2.userId).toBe(u3.uniqueId);
    });

    test("check password match no email", async () => {
        const result = await userController.checkPasswordMatch("fake", "fake");
        expect(result).not.toBeInstanceOf(Error);
        expect(result).toBeNull();
    });
    test("check password match one email", async () => {
        const result = await userController.checkPasswordMatch(
            u1.email,
            u1pass
        );
        expect(result).not.toBeInstanceOf(Error);
        expect(result).not.toBeNull();
        expect(result).toBeTrue();

        const badResult = await userController.checkPasswordMatch(
            u1.email,
            u2pass
        );
        expect(badResult).not.toBeInstanceOf(Error);
        expect(badResult).not.toBeNull();
        expect(badResult).toBeFalse();
    });
    test("check password match two emails", async () => {
        const res1 = await userController.checkPasswordMatch(u2.email, u2pass);
        expect(res1).not.toBeInstanceOf(Error);
        expect(res1).not.toBeNull();
        expect(res1).toBeTrue();

        const badResult1 = await userController.checkPasswordMatch(
            u2.email,
            u3pass
        );
        expect(badResult1).not.toBeInstanceOf(Error);
        expect(badResult1).not.toBeNull();
        expect(badResult1).toBeFalse();

        const res2 = await userController.checkPasswordMatch(u3.email, u3pass);
        expect(res2).not.toBeInstanceOf(Error);
        expect(res2).not.toBeNull();
        expect(res1).toBeTrue();

        const badResult2 = await userController.checkPasswordMatch(
            u3.email,
            u1pass
        );
        expect(badResult2).not.toBeInstanceOf(Error);
        expect(badResult2).not.toBeNull();
        expect(badResult2).toBeFalse();
    });

    const newUser = new User({
        uniqueId: "getUsersResponses",
        email: "getUsersResponses",
    });
    const response1 = new Response({
        uniqueId: "getUsersResponses1",
        respondentId: newUser.uniqueId,
        surveyId: sampleSurvey.uniqueId,
    });
    test("get users responses no responses", async () => {
        await storage.save(sampleSurvey.uniqueId, sampleSurvey);

        const res = await storage.save(newUser.uniqueId, newUser);
        expect(res).not.toBeInstanceOf(Error);

        const allResponsesResult = await userController.getUsersResponses(
            newUser.uniqueId
        );
        expect(allResponsesResult).toBeNull();
    });
    test("get users responses one response", async () => {
        const res2 = await storage.save(response1.uniqueId, response1);
        expect(res2).not.toBeInstanceOf(Error);

        const allResponsesResult = await userController.getUsersResponses(
            newUser.uniqueId
        );
        expect(allResponsesResult).toBeArray();
        expect(
            (allResponsesResult as Response[])
                .map((r) => r.uniqueId)
                .includes(response1.uniqueId)
        ).toBeTrue();
    });
    test("get users responses two responses", async () => {
        const response2 = new Response({
            uniqueId: "getUsersResponses2",
            respondentId: newUser.uniqueId,
            surveyId: sampleSurvey.uniqueId,
        });
        const res3 = await storage.save(response2.uniqueId, response2);
        expect(res3).not.toBeInstanceOf(Error);

        const response3 = new Response({
            uniqueId: "getUsersResponses3",
            respondentId: newUser.uniqueId,
            surveyId: sampleSurvey.uniqueId,
        });
        const res4 = await storage.save(response3.uniqueId, response3);
        expect(res4).not.toBeInstanceOf(Error);

        const allResponsesResult = await userController.getUsersResponses(
            newUser.uniqueId
        );
        expect(allResponsesResult).toBeArray();
        expect(
            (allResponsesResult as Response[])
                .map((r) => r.uniqueId)
                .includes(response1.uniqueId)
        ).toBeTrue();
        expect(
            (allResponsesResult as Response[])
                .map((r) => r.uniqueId)
                .includes(response2.uniqueId)
        ).toBeTrue();
        expect(
            (allResponsesResult as Response[])
                .map((r) => r.uniqueId)
                .includes(response2.uniqueId)
        ).toBeTrue();
    });
});
