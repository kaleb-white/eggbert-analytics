import { Password } from "@/core/entities/users/password";
import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";

export interface UserController {
    hashPassword(password: string): Promise<string | Error>;
    getUser(uniqueId: string | Session): Promise<User | Error | null>;
    getUserByEmail(email: string): Promise<User | Error | null>;
    getPassword(userId: string): Promise<Password | Error | null>;
    getUserAndPasswordByEmail(
        email: string
    ): Promise<[User, Password] | Error | null>;
    createOrUpdateUser(newUser: User, password: string): Promise<Error | null>;
    deleteUser(identifier: User | Session): Promise<Error | null>;
    checkPasswordMatch(
        email: string,
        password: string
    ): Promise<boolean | Error | null>;
}
