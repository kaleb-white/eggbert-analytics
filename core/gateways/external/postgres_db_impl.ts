/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database } from "../interfaces/external/database";
import { executeStatements } from "@/persistent_storage/postgres_db/execution_utilities";
import {
    getAllEntities,
    ParameterizedStatementSets,
} from "@/persistent_storage/postgres_db/generation_types_and_utilities";
import { Pool } from "pg";
import { isEntity } from "@/stable_utilities/global_type_check";
import {
    getResponses,
    saveResponses,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/responses";
import {
    getQuestionResponses,
    saveQuestionResponses,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/question_responses";
import {
    getQuestions,
    saveQuestions,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/questions";
import {
    getTurns,
    saveTurns,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/turns";
import {
    getSurveys,
    saveSurveys,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/survey";
import { Survey } from "@/core/entities/surveys/survey";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Question } from "@/core/entities/surveys/question";
import { Turn } from "@/core/entities/surveys/turn";

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
                    "survey"
                );
                break;
            case "response":
                promise = genAndExecuteGetSql<Response>(
                    getResponses,
                    [id],
                    this.pool,
                    "response"
                );
                break;
            case "questionresponse":
                promise = genAndExecuteGetSql<QuestionResponse>(
                    getQuestionResponses,
                    [id],
                    this.pool,
                    "questionResponse"
                );
                break;
            case "question":
                promise = genAndExecuteGetSql<Question>(
                    getQuestions,
                    [id],
                    this.pool,
                    "question"
                );
                break;
            case "turn":
                promise = genAndExecuteGetSql<Turn>(
                    getTurns,
                    [id],
                    this.pool,
                    "turn"
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
