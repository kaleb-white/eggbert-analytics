/* eslint-disable @typescript-eslint/no-explicit-any */
import { isT } from "@/utilities/global_type_check";
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

    /**
     *
     * @param id The uniqueId of the object.
     * @param obj The object itself.
     * @param noCache If set, will no try to cache the object, will just persist it to the database. In this case, id is ignored.
     * @returns
     */
    async save(
        id: string,
        obj: any,
        noCache: boolean = false
    ): Promise<null | Error> {
        if (!noCache) {
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
        } else {
            const tryDbSave = await this.database.save(obj);
            if (tryDbSave instanceof Error) return tryDbSave;
            return null;
        }
    }

    async get<T>(
        id: string,
        objOfTypeT: T,
        field: string = "uniqueId"
    ): Promise<T | null | Error> {
        // Object to hold result
        const result: Result<T> = {
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
            result.result = tryCacheLoad as T;
            result.finished = true;
            result.success = true;
        }
        // Unexpected fail
        if (
            !result.finished &&
            !(tryCacheLoad instanceof Error) &&
            !isT<T>(tryCacheLoad, objOfTypeT)
        ) {
            result.error = new Error(
                `Cache returned something that wasn't of type T or an error: ${JSON.stringify(
                    tryCacheLoad
                )}`
            );
            result.finished = true;
            result.success = false;
        }

        // Check if finished
        if (result.finished) {
            await this.cache.get("fake", true);
            return returnResultOrError<T>(result);
        }

        // Try and get from database
        const tryDatabaseLoad = await this.database.get<T>(
            id,
            objOfTypeT,
            field
        );
        // Success
        if (
            !(tryDatabaseLoad instanceof Error) &&
            isT<T>(tryDatabaseLoad, objOfTypeT)
        ) {
            // Save to cache
            await this.cache.save(id, tryDatabaseLoad as object, true);

            result.result = tryDatabaseLoad as T;
            result.finished = true;
            result.success = true;
            result.cacheFinished = true;
        }
        // No result means no data
        if (!result.finished && !tryDatabaseLoad) {
            result.result = null;
            result.finished = true;
            result.success = true;
        }
        // Unexpected failure where database did not error but unexpected obj was returned
        if (
            !result.finished &&
            !(tryDatabaseLoad instanceof Error) &&
            !isT<T>(tryDatabaseLoad, objOfTypeT)
        ) {
            result.error = new Error(
                `Database returned something that wasn't of type T or an error: ${JSON.stringify(
                    tryDatabaseLoad
                )}. Missing fields from objOfTypeT include: ${Object.keys(
                    objOfTypeT as object
                )
                    .map((field) => {
                        if (
                            tryDatabaseLoad instanceof Error ||
                            !tryDatabaseLoad
                        )
                            return;
                        if (!Object.keys(tryDatabaseLoad).includes(field))
                            return field;
                        return "xx";
                    })
                    .filter((fieldName) => fieldName !== "xx")
                    .join(", ")}`
            );
            result.finished = true;
            result.success = false;
        }

        // Both failed, but cache fail could be 'innocent'
        if (!result.finished && tryDatabaseLoad instanceof Error) {
            result.error = tryDatabaseLoad;
            result.finished = true;
            result.success = false;
        }

        if (!result.cacheFinished) {
            await this.cache.get("fake", true);
        }
        return returnResultOrError(result);
    }
}
