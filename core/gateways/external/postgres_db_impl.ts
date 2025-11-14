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
    getResponses,
    saveResponses,
} from "@/storage/postgres_db/sql_generators_by_entity/responses";
import {
    getQuestionResponses,
    saveQuestionResponses,
} from "@/storage/postgres_db/sql_generators_by_entity/question_responses";
import {
    getQuestions,
    saveQuestions,
} from "@/storage/postgres_db/sql_generators_by_entity/questions";
import {
    getTurns,
    saveTurns,
} from "@/storage/postgres_db/sql_generators_by_entity/turns";
import {
    getSurveys,
    saveSurveys,
} from "@/storage/postgres_db/sql_generators_by_entity/survey";
import { Survey } from "@/core/entities/surveys/survey";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Question } from "@/core/entities/surveys/question";
import { Turn } from "@/core/entities/surveys/turn";
import {
    getUsers,
    saveUsers,
} from "@/storage/postgres_db/sql_generators_by_entity/users";
import {
    getSessions,
    saveSessions,
} from "@/storage/postgres_db/sql_generators_by_entity/sessions";
import { Respondent } from "@/core/entities/users/respondent";
import { Author } from "@/core/entities/users/author";
import { Anonymous } from "@/core/entities/users/anonymous";
import { Session } from "@/core/entities/users/session";
import {
    getPasswords,
    savePasswords,
} from "@/storage/postgres_db/sql_generators_by_entity/passwords";
import { Password } from "@/core/entities/users/password";

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
    sqlGen: (ids: string[]) => ParameterizedStatementSets,
    ids: string[],
    pool: Pool,
    entityName: string
): Promise<T[] | null | Error> {
    const getResult = await executeStatements(sqlGen(ids), pool);
    if (getResult instanceof Error) return getResult;
    if (getResult.length == 0) return null;
    // This is a terrible way to do it lol
    const entities = getAllEntities<T>(getResult, entityName.concat("Agg"));
    return entities;
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

    async get<T>(id: string, objOfTypeT: T): Promise<T | null | Error> {
        const entityName = isEntity(objOfTypeT);
        let promise: Promise<any[] | Error | null>;
        switch (entityName) {
            case "survey":
                promise = genAndExecuteGetSql<Survey>(
                    getSurveys,
                    [id],
                    this.pool,
                    "surveys"
                );
                break;
            case "response":
                promise = genAndExecuteGetSql<Response>(
                    getResponses,
                    [id],
                    this.pool,
                    "responses"
                );
                break;
            case "questionresponse":
                promise = genAndExecuteGetSql<QuestionResponse>(
                    getQuestionResponses,
                    [id],
                    this.pool,
                    "questionResponses"
                );
                break;
            case "question":
                promise = genAndExecuteGetSql<Question>(
                    getQuestions,
                    [id],
                    this.pool,
                    "questions"
                );
                break;
            case "turn":
                promise = genAndExecuteGetSql<Turn>(
                    getTurns,
                    [id],
                    this.pool,
                    "turns"
                );
                break;
            case "respondent":
                promise = genAndExecuteGetSql<Respondent>(
                    getUsers,
                    [id],
                    this.pool,
                    "users"
                );
                break;
            case "anonymous":
                promise = genAndExecuteGetSql<Anonymous>(
                    getUsers,
                    [id],
                    this.pool,
                    "users"
                );
                break;
            case "author":
                promise = genAndExecuteGetSql<Author>(
                    getUsers,
                    [id],
                    this.pool,
                    "users"
                );
                break;
            case "session":
                promise = genAndExecuteGetSql<Session>(
                    getSessions,
                    [id],
                    this.pool,
                    "users"
                );
                break;
            case "password":
                promise = genAndExecuteGetSql<Password>(
                    getPasswords,
                    [id],
                    this.pool,
                    "passwords"
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
        return res[0] as T;
    }
}
