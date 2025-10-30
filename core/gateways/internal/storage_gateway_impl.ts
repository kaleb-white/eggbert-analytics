/* eslint-disable @typescript-eslint/no-explicit-any */
import { isT } from "@/stable_utilities/global_type_check";
import { Cache } from "../interfaces/external/cache";
import { Database } from "../interfaces/external/database";
import { StorageGateway } from "../interfaces/internal/storage_gateway";

type Result<T> = {
    error: Error | null;
    result: T | null;
    success: boolean;
    finished: boolean;
    cacheFinished: boolean;
};

function returnResultOrError<T>(res: Result<T>) {
    if (res.success) return res.result;
    else return res.error;
}

export class StorageGatewayImpl implements StorageGateway {
    private cache: Cache;
    private database: Database;

    constructor(cache: Cache, database: Database) {
        this.cache = cache;
        this.database = database;
    }

    async save(id: string, obj: any): Promise<null | Error> {
        const toBeExecuted = [
            this.cache.save(id, obj, true),
            this.database.save(obj),
        ];
        const promises = await Promise.all(toBeExecuted);
        const tryCacheSave = promises[0];
        const tryDbSave = promises[1];

        if (tryCacheSave instanceof Error && tryDbSave instanceof Error)
            return new Error(
                `Failed to save to cache or db. Cache failure message was ${tryCacheSave.message}. Db failure message was ${tryDbSave.message}`
            );
        if (tryDbSave instanceof Error) return tryDbSave;

        return null;
    }

    async get<T>(id: string, objOfTypeT: T): Promise<T | null | Error> {
        // Object to hold result
        const resultObj: Result<T> = {
            error: null,
            result: null,
            success: false,
            finished: false,
            cacheFinished: false,
        };

        // Try and get from cache
        const tryCacheLoad = await this.cache.get(id, false);
        // Success
        if (
            !(tryCacheLoad instanceof Error) &&
            isT<T>(tryCacheLoad, objOfTypeT)
        ) {
            resultObj.result = tryCacheLoad as T;
            resultObj.finished = true;
            resultObj.success = true;
        }
        // Unexpected fail
        if (
            !resultObj.finished &&
            !(tryCacheLoad instanceof Error) &&
            !isT<T>(tryCacheLoad, objOfTypeT)
        ) {
            resultObj.error = new Error(
                `Cache returned something that wasn't of type T or an error: ${JSON.stringify(
                    tryCacheLoad
                )}`
            );
            resultObj.finished = true;
            resultObj.success = false;
        }

        // Check if finished
        if (resultObj.finished) {
            await this.cache.get("fake", true);
            return returnResultOrError<T>(resultObj);
        }

        // Try and get from database
        const tryDatabaseLoad = await this.database.get<T>(id, objOfTypeT);
        // Success
        if (
            !(tryDatabaseLoad instanceof Error) &&
            isT<T>(tryDatabaseLoad, objOfTypeT)
        ) {
            // Save to cache
            await this.cache.save(id, tryDatabaseLoad as object, true);

            resultObj.result = tryDatabaseLoad as T;
            resultObj.finished = true;
            resultObj.success = true;
            resultObj.cacheFinished = true;
        }
        // No result means no data
        if (!resultObj.finished && !tryDatabaseLoad) {
            resultObj.result = null;
            resultObj.finished = true;
            resultObj.success = true;
        }
        // Unexpected failure
        if (
            !resultObj.finished &&
            !(tryDatabaseLoad instanceof Error) &&
            !isT<T>(tryDatabaseLoad, objOfTypeT)
        ) {
            resultObj.error = new Error(
                `Database returned something that wasn't of type T or an error: ${JSON.stringify(
                    tryDatabaseLoad
                )}`
            );
            resultObj.finished = true;
            resultObj.success = false;
        }

        // Both failed, but cache fail could be 'innocent'
        if (!resultObj.finished && tryDatabaseLoad instanceof Error) {
            resultObj.error = tryDatabaseLoad;
            resultObj.finished = true;
            resultObj.success = false;
        }

        if (!resultObj.cacheFinished) {
            await this.cache.get("fake", true);
        }

        return returnResultOrError(resultObj);
    }
}
