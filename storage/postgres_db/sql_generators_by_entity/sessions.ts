import { Session } from "@/core/entities/users/session";
import {
    createParameterizedStatement,
    ParameterizedStatementSets,
} from "../generation_types_and_utilities";
import {
    createJsonbSession,
    createJsonbSessions,
    insertOrUpdateSession,
    insertOrUpdateSessions,
} from "../sql_generators_by_table/sessions";

export function getSessions(
    ids: string[],
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbSessions()}
                FROM sessions
                WHERE sessions.${field} IN ${createParameterizedStatement(
                ids.length,
                ids.length
            )};
            `,
            userInput: ids,
        },
    ];
}

export function getSession(
    id: string,
    field: string = "uniqueId"
): ParameterizedStatementSets {
    return [
        {
            sql: `
            SELECT ${createJsonbSession()}
                FROM sessions
                WHERE sessions.${field} = $1;
            `,
            userInput: [id],
        },
    ];
}

export function saveSessions(sessions: Session[]): ParameterizedStatementSets {
    if (sessions.length == 0) return ["pass"];
    return [insertOrUpdateSessions(sessions)];
}

export function saveSession(session: Session): ParameterizedStatementSets {
    return [insertOrUpdateSession(session)];
}
