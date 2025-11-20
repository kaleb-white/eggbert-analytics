import { userController } from "@/injections";
import { describe, expect, test } from "bun:test";
import * as argon2 from "argon2";

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
});
