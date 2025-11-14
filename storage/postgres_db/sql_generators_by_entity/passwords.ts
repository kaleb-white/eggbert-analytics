import { Password } from "@/core/entities/users/password";
import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    createJsonbPassword,
    createJsonbPasswords,
    insertOrUpdatePassword,
    insertOrUpdatePasswords,
} from "../sql_generators_by_table/passwords";

export function getPasswords(userIds: string[]): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbPasswords}
                FROM passwords
                WHERE passwords.userId IN ${createParameterizedStatement(
                    userIds.length,
                    userIds.length
                )}
            `,
            userInput: userIds,
        },
    ];
}

export function getSession(userId: string): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbPassword()}
                FROM passwords
                WHERE passwords.uniqueId = $1;
            `,
            userInput: [userId],
        },
    ];
}

export function savePasswords(
    passwords: Password[]
): ParameterizedStatementSets {
    if (passwords.length === 0) return ["pass"];
    return [insertOrUpdatePasswords(passwords)];
}

export function savePassword(password: Password): ParameterizedStatementSets {
    return [insertOrUpdatePassword(password)];
}
