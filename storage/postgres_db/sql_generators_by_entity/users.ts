import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    createJsonbUser,
    createJsonbUsers,
    insertOrUpdateUser,
    insertOrUpdateUsers,
} from "../sql_generators_by_table/user";
import { User } from "@/core/entities/users/user";

export function getUsers(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbUsers()}
                FROM users
                WHERE users.${field} IN ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
            `,
            userInput: ids,
        },
    ];
}

export function getUser(
    id: string,
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbUser()}
                FROM users
                WHERE users.${field} = $1;
            `,
            userInput: [id],
        },
    ];
}

export function saveUsers(users: User[]): ParameterizedStatementSets {
    if (users.length == 0) return ["pass"];
    return [insertOrUpdateUsers(users)];
}

export function saveUser(user: User): ParameterizedStatementSets {
    return [insertOrUpdateUser(user)];
}
