import { Session } from "@/core/entities/users/session";
import { User } from "@/core/entities/users/user";

export interface UserController {
    hashPassword(password: string): Promise<string | Error>;
    getUser(uniqueId: string | Session): Promise<User | Error | null>;
    createOrUpdateUser(newUser: User): Promise<Error | null>;
    deleteUser(identifier: User | Session): Promise<Error | null>;
}
