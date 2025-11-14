import { User } from "@/core/entities/users/user";
import {
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";

export function insertOrUpdateUsers(users: User[]): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "role",
        "email",
        "timeCreated",
        "lastLogin",
    ];
    const allUsersValues = getAllEntityValuesAsArray(users, orderedFields);
    if (!allUsersValues) return "pass";
    return {
        sql: `
        INSERT INTO users (uniqueId, role, email, timeCreated, lastLogin)
            VALUES ${createParameterizedStatement(5, 5 * users.length)}
            ON CONFLICT (uniqueId) DO UPDATE SET lastLogin = EXCLUDED.lastLogin;
        `,
        userInput: allUsersValues,
    };
}

export function insertOrUpdateUser(user: User): PossibleStatementFormat {
    return {
        sql: `
        INSERT INTO users (uniqueId, role, email, timeCreated, lastLogin)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (uniqueId) DO UPDATE SET lastLogin = EXCLUDED.lastLogin;
        `,
        userInput: [
            user.uniqueId,
            user.role,
            user.email,
            String(user.timeCreated),
            String(user.lastLogin),
        ],
    };
}

export function createJsonbUsers(as: string = "usersAgg") {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', users.uniqueId,
        'role', users.role,
        'email', users.email,
        'timeCreated', users.timeCreated,
        'lastLogin', users.lastLogin
    )) AS ${as}
    `;
}

export function createJsonbUser(as: string = "jsonb_build_object") {
    return `
    jsonb_build_object(
        'uniqueId', users.uniqueId,
        'role', users.role,
        'email', users.email,
        'timeCreated', users.timeCreated,
        'lastLogin', users.lastLogin
    ) AS ${as}
    `;
}

export function leftJoinUsers(
    manyTableName: string,
    manyTableRelevantId: string,
    as: string
) {
    return `
    LEFT JOIN (
        SELECT ${createJsonbUser("user")}, uniqueId
            FROM users
    ) ${as} ON ${manyTableName}.${manyTableRelevantId} = ${as}.uniqueId
    `;
}
