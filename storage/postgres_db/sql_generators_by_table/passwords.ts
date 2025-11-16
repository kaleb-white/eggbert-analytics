import { Password } from "@/core/entities/users/password";
import {
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";

export function insertOrUpdatePasswords(
    passwords: Password[]
): PossibleStatementFormat {
    const orderedFields = ["userId", "hash"];
    const allPasswordsValues = getAllEntityValuesAsArray(
        passwords,
        orderedFields
    );
    if (!allPasswordsValues) return "pass";
    return {
        sql: `
        INSERT INTO passwords (userId, hash)
            VALUES ${createParameterizedStatement(2, 2 * passwords.length)}
            ON CONFLICT (userId) DO UPDATE SET hash = EXCLUDED.hash;
        `,
        userInput: allPasswordsValues,
    };
}

export function insertOrUpdatePassword(
    password: Password
): PossibleStatementFormat {
    return {
        sql: `INSERT INTO passwords (userId, hash)
            VALUES ($1, $3)
            ON CONFLICT (userId) DO UPDATE SET hash = EXCLUDED.hash;
        `,
        userInput: [password.userId, password.hash],
    };
}

export function createJsonbPasswords(as: string = "passwordsAgg") {
    return `
        jsonb_agg(jsonb_build_object(
            'userId', passwords.userId,
            'hash', passwords.hash
        )) AS ${as}
    `;
}

export function createJsonbPassword(as: string = "jsonb_build_object") {
    return `
        jsonb_build_object(
            'userId', passwords.userId,
            'hash', passwords.hash
        ) AS ${as}
    `;
}
