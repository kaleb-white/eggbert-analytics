import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";
import { UserController } from "./interfaces/user_controller";
import * as argon2 from "argon2";
import { storage } from "@/injections";
import { Password } from "@/core/entities/users/password";

export class UserControllerImpl implements UserController {
    async hashPassword(password: string): Promise<string | Error> {
        let hash: string | Error | PromiseLike<string | Error>;
        try {
            if (!process.env.PEPPER)
                return new Error("Error while hashing: no pepper found");
            // Parameters: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
            hash = await argon2.hash(password.concat(process.env.PEPPER), {
                type: argon2.argon2id,
                memoryCost: 47104,
                timeCost: 1,
                parallelism: 1,
            });
        } catch (err) {
            return new Error(`Error while hashing pass: ${err}`);
        }
        return hash;
    }

    async getUser(uniqueId: string | Session): Promise<User | Error | null> {
        const uniqueIdDetermination =
            typeof uniqueId === "string" ? uniqueId : uniqueId.userId;
        const dbResult = await storage.get(uniqueIdDetermination, new User());
        return dbResult;
    }

    async getUserByEmail(email: string): Promise<User | Error | null> {
        const dbResult = await storage.get(email, new User(), "email");
        return dbResult;
    }

    async getPassword(userId: string): Promise<Password | Error | null> {
        return await storage.get(userId, new Password(), "userId");
    }

    async getUserAndPasswordByEmail(
        email: string
    ): Promise<[User, Password] | Error | null> {
        const user = await this.getUserByEmail(email);
        if (!user || user instanceof Error) {
            return user;
        }
        const password = await this.getPassword(user.uniqueId);
        if (!password || password instanceof Error) {
            return password;
        }
        return [user, password];
    }

    async checkPassword(
        email: string,
        password: string
    ): Promise<boolean | Error> {
        const userAndPassword = await this.getUserAndPasswordByEmail(email);
        if (!userAndPassword) {
            return new Error("No user found with that email");
        } else if (userAndPassword instanceof Error) {
            return userAndPassword;
        }

        const [user, correctPasswordHash] = userAndPassword;
        const providedPasswordHash = await this.hashPassword(password);
        return providedPasswordHash === correctPasswordHash.hash;
    }

    async createOrUpdateUser(
        newUser: User,
        password: string
    ): Promise<Error | null> {
        const userSaveResult = await storage.save(newUser.uniqueId, newUser);
        if (userSaveResult instanceof Error) {
            return userSaveResult;
        }

        const hash = await this.hashPassword(password);
        if (hash instanceof Error) {
            return hash;
        }

        const passwordEntity = new Password({
            hash: hash,
            userId: newUser.uniqueId,
        });
        const passwordSaveResult = await storage.save(
            "none",
            passwordEntity,
            true
        );
        if (passwordSaveResult instanceof Error) return passwordSaveResult;
        //TODO: delete user in this case
        return null;
    }
    deleteUser(identifier: User | Session): Promise<Error | null> {
        throw new Error("Method not implemented.");
    }
}
