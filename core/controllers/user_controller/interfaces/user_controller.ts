import { Session } from "@/core/entities/users/session";
import { User, UserProps } from "@/core/entities/users/user";

export interface UserController {
    hashPassword(password: string): string;
    getUser(identifier: string | Session): Promise<User | Error | null>;
    createOrUpdateUser(newProps: UserProps): Promise<Error | null>;
    deleteUser(identifier: User | Session): Promise<Error | null>;
}
