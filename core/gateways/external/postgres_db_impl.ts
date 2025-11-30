/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database } from "../interfaces/external/database";
import { executeStatements } from "@/storage/postgres_db/execution_utilities";
import {
    getAllEntities,
    ParameterizedStatementSets,
} from "@/storage/postgres_db/generation_types_and_utilities";
import { Pool } from "pg";
import { isEntity } from "@/utilities/global_type_check";
import {
    deleteResponses,
    getResponses,
    saveResponses,
} from "@/storage/postgres_db/sql_generators_by_entity/responses";
import {
    deleteQuestionResponses,
    getQuestionResponses,
    saveQuestionResponses,
} from "@/storage/postgres_db/sql_generators_by_entity/question_responses";
import {
    deleteQuestions,
    getQuestions,
    saveQuestions,
} from "@/storage/postgres_db/sql_generators_by_entity/questions";
import {
    deleteTurns,
    getTurns,
    saveTurns,
} from "@/storage/postgres_db/sql_generators_by_entity/turns";
import {
    deleteSurveys,
    getSurveys,
    saveSurveys,
} from "@/storage/postgres_db/sql_generators_by_entity/survey";
import { Survey } from "@/core/entities/surveys/survey";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Question } from "@/core/entities/surveys/question";
import { Turn } from "@/core/entities/surveys/turn";
import {
    deleteUsers,
    getUsers,
    saveUsers,
} from "@/storage/postgres_db/sql_generators_by_entity/users";
import {
    deleteSessions,
    getSessions,
    saveSessions,
} from "@/storage/postgres_db/sql_generators_by_entity/sessions";
import { Respondent } from "@/core/entities/users/respondent";
import { Author } from "@/core/entities/users/author";
import { Anonymous } from "@/core/entities/users/anonymous";
import { Session } from "@/core/entities/users/session";
import {
    deletePasswords,
    getPasswords,
    savePasswords,
} from "@/storage/postgres_db/sql_generators_by_entity/passwords";
import { Password } from "@/core/entities/users/password";
import { User } from "@/core/entities/users/user";

async function genAndExecuteSaveSql(
    sqlGen: (any: any[]) => ParameterizedStatementSets,
    objs: any[],
    pool: Pool
): Promise<null | Error> {
    const saveResult = await executeStatements(sqlGen(objs), pool);
    if (saveResult instanceof Error) return saveResult;
    return null;
}

async function genAndExecuteGetSql<T>(
    sqlGen: (ids: string[], field?: string) => ParameterizedStatementSets,
    ids: string[],
    pool: Pool,
    field: string = "uniqueId"
): Promise<T[] | null | Error> {
    const getResult = await executeStatements(sqlGen(ids, field), pool);
    if (getResult instanceof Error) return getResult;
    if (getResult.length === 0) return null;
    const entities = getAllEntities<T>(getResult);
    return entities;
}

async function genAndExecuteDeleteSql(
    sqlGen: (ids: string[], field?: string) => ParameterizedStatementSets,
    ids: string[],
    pool: Pool,
    field: string = "uniqueId"
): Promise<string[] | null | Error> {
    const deleteResult = await executeStatements(sqlGen(ids, field), pool);
    if (deleteResult instanceof Error) return deleteResult;
    if (deleteResult.length === 0 || deleteResult[0].rowCount === 0)
        return null;
    // Referencing 0 directly because a single statement is being executed
    return deleteResult[0].rows
        .map((result) => {
            if (Object.keys(result).includes(field.toLowerCase())) {
                return result[field.toLowerCase()];
            }
            return null;
        })
        .filter((r) => r) as string[];
}

export class PostgresDbImpl implements Database {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async save(obj: any): Promise<null | Error> {
        const entityName = isEntity(obj);
        let res: Error | null;
        switch (entityName) {
            case "survey":
                res = await genAndExecuteSaveSql(saveSurveys, [obj], this.pool);
                break;
            case "response":
                res = await genAndExecuteSaveSql(
                    saveResponses,
                    [obj],
                    this.pool
                );
                break;
            case "questionresponse":
                res = await genAndExecuteSaveSql(
                    saveQuestionResponses,
                    [obj],
                    this.pool
                );
                break;
            case "question":
                res = await genAndExecuteSaveSql(
                    saveQuestions,
                    [obj],
                    this.pool
                );
                break;
            case "turn":
                res = await genAndExecuteSaveSql(saveTurns, [obj], this.pool);
                break;
            case "respondent":
            case "author":
            case "anonymous":
            case "user":
                res = await genAndExecuteSaveSql(saveUsers, [obj], this.pool);
                break;
            case "session":
                res = await genAndExecuteSaveSql(
                    saveSessions,
                    [obj],
                    this.pool
                );
                break;
            case "password":
                res = await genAndExecuteSaveSql(
                    savePasswords,
                    [obj],
                    this.pool
                );
                break;
            default:
                return new Error(
                    `Object unrecognized as registered entity (type check missing?). Object was ${JSON.stringify(
                        obj
                    )}`
                );
        }
        if (res instanceof Error) return res;
        return null;
    }

    async get<T>(
        id: string,
        objOfTypeT: T,
        field: string = "uniqueId",
        all: boolean = false
    ): Promise<T | T[] | null | Error> {
        const entityName = isEntity(objOfTypeT);
        let promise: Promise<any[] | Error | null>;
        switch (entityName) {
            case "survey":
                promise = genAndExecuteGetSql<Survey>(
                    getSurveys,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "response":
                promise = genAndExecuteGetSql<Response>(
                    getResponses,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "questionresponse":
                promise = genAndExecuteGetSql<QuestionResponse>(
                    getQuestionResponses,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "question":
                promise = genAndExecuteGetSql<Question>(
                    getQuestions,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "turn":
                promise = genAndExecuteGetSql<Turn>(
                    getTurns,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "respondent":
                promise = genAndExecuteGetSql<Respondent>(
                    getUsers,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "anonymous":
                promise = genAndExecuteGetSql<Anonymous>(
                    getUsers,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "author":
                promise = genAndExecuteGetSql<Author>(
                    getUsers,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "user":
                promise = genAndExecuteGetSql<User>(
                    getUsers,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "session":
                promise = genAndExecuteGetSql<Session>(
                    getSessions,
                    [id],
                    this.pool,
                    field
                );
                break;
            case "password":
                promise = genAndExecuteGetSql<Password>(
                    getPasswords,
                    [id],
                    this.pool,
                    "userId"
                );
                break;
            default:
                return new Error(
                    `Object unrecognized as registered entity (type check missing?). Object was ${JSON.stringify(
                        objOfTypeT
                    )}`
                );
        }
        const res = await promise;
        if (!res || res instanceof Error) return res;
        if (!all) return res[0] as T;
        return res as T[];
    }

    async delete<T>(
        ids: string | string[],
        objOfTypeT: T,
        field?: string
    ): Promise<string[] | null | Error> {
        const idArray = Array.isArray(ids) ? ids : [ids];
        const entityName = isEntity(objOfTypeT);
        let promise: Promise<string[] | null | Error>;
        switch (entityName) {
            case "survey":
                promise = genAndExecuteDeleteSql(
                    deleteSurveys,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "response":
                promise = genAndExecuteDeleteSql(
                    deleteResponses,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "questionresponse":
                promise = genAndExecuteDeleteSql(
                    deleteQuestionResponses,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "question":
                promise = genAndExecuteDeleteSql(
                    deleteQuestions,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "turn":
                promise = genAndExecuteDeleteSql(
                    deleteTurns,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "respondent":
                promise = genAndExecuteDeleteSql(
                    deleteUsers,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "anonymous":
                promise = genAndExecuteDeleteSql(
                    deleteUsers,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "author":
                promise = genAndExecuteDeleteSql(
                    deleteUsers,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "user":
                promise = genAndExecuteDeleteSql(
                    deleteUsers,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "session":
                promise = genAndExecuteDeleteSql(
                    deleteSessions,
                    idArray,
                    this.pool,
                    field
                );
                break;
            case "password":
                promise = genAndExecuteDeleteSql(
                    deletePasswords,
                    idArray,
                    this.pool,
                    "userId"
                );
                break;
            default:
                return new Error(
                    `Object unrecognized as registered entity (type check missing?). Object was ${JSON.stringify(
                        objOfTypeT
                    )}`
                );
        }
        return await promise;
    }
}
