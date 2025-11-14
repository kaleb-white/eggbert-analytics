import {
    createParameterizedStatement,
    getAllEntityValuesAsArray,
    PossibleStatementFormat,
} from "../generation_types_and_utilities";
import { Session } from "@/core/entities/users/session";

export function insertOrUpdateSessions(
    sessions: Session[]
): PossibleStatementFormat {
    const orderedFields = [
        "uniqueId",
        "antiCsrfToken",
        "userId",
        "role",
        "expiration",
    ];
    const allUsersValues = getAllEntityValuesAsArray(sessions, orderedFields);
    if (!allUsersValues) return "pass";
    return {
        sql: `
        INSERT INTO sessions (uniqueId, antiCsrfToken, userId, role, expiration)
            VALUES ${createParameterizedStatement(5, 5 * sessions.length)}
            ON CONFLICT (uniqueId) DO UPDATE SET expiration = EXCLUDED.expiration;
        `,
        userInput: allUsersValues,
    };
}

export function insertOrUpdateSession(
    session: Session
): PossibleStatementFormat {
    return {
        sql: `
        INSERT INTO sessions (uniqueId, antiCsrfToken, userId, role, expiration)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (uniqueId) DO UPDATE SET expiration = EXCLUDED.expiration;
        `,
        userInput: [
            session.uniqueId,
            session.antiCsrfToken,
            session.userId,
            session.role,
            String(session.expiration),
        ],
    };
}

export function createJsonbSessions(as: string = "sessionsAgg") {
    return `
    jsonb_agg(jsonb_build_object(
        'uniqueId', sessions.uniqueId,
        'antiCsrfToken', sessions.antiCsrfToken,
        'userId', sessions.userId,
        'role', sessions.role,
        'expiration', sessions.expiration
    )) AS ${as}
    `;
}

export function createJsonbSession(as: string = "jsonb_build_object") {
    return `
    jsonb_build_object(
        'uniqueId', sessions.uniqueId,
        'antiCsrfToken', sessions.antiCsrfToken,
        'userId', sessions.userId,
        'role', sessions.role,
        'expiration', sessions.expiration
    ) AS ${as}
    `;
}
