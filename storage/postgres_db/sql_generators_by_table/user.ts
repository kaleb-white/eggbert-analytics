import { User } from "@/core/entities/users/user";
import { PossibleStatementFormat } from "../generation_types_and_utilities";

export function insertOrUpdateUser(user: User): PossibleStatementFormat {
    return {
        sql: `
        INSERT INTO users (uniqueId)
            VALUES ($1)
            ON CONFLICT (uniqueId) DO NOTHING;
        `,
        userInput: [user.uniqueId],
    };
}

export function createJsonbUser(as: string = "user") {
    return `
    jsonb_build_object(
        'uniqueId', users.uniqueId
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
        SELECT ${createJsonbUser()}, uniqueId
            FROM users
    ) ${as} ON ${manyTableName}.${manyTableRelevantId} = ${as}.uniqueId
    `;
}
