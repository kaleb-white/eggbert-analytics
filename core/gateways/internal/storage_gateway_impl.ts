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

function formatObjectMismatchErrorMsg(
    cacheOrDatabase: string,
    returnedObject: object,
    expectedObject: object
) {
    return `${cacheOrDatabase} returned something that wasn't of type T or an error: ${JSON.stringify(
        returnedObject
    )}. Missing fields from objOfTypeT include: ${Object.keys(
        expectedObject as object
    )
        .map((field) => {
            if (returnedObject instanceof Error || !returnedObject) return;
            if (!Object.keys(returnedObject).includes(field)) return field;
            return "xx";
        })
        .filter((fieldName) => fieldName !== "xx")
        .join(", ")}`;
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

    async get<T extends object>(
        id: string,
        objOfTypeT: T,
        field: string = "uniqueId",
        noCache: boolean = false
    ): Promise<T | null | Error> {
        // Object to hold result
        const result: Result<T> = {
            error: null,
            result: null,
            success: false,
            finished: false,
            cacheFinished: false,
        };

        if (!noCache) {
            // Try and get from cache
            const tryCacheLoad = await this.cache.get<T>(id, false);
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
                    formatObjectMismatchErrorMsg(
                        "Cache",
                        tryCacheLoad,
                        objOfTypeT
                    )
                );
                result.finished = true;
                result.success = false;
            }

            // Check if finished
            if (result.finished) {
                await this.cache.get("fake", true);
                return returnResultOrError<T>(result);
            }
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
            if (!noCache) {
                // Save to cache
                await this.cache.save(id, tryDatabaseLoad as object, true);
            }

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
                formatObjectMismatchErrorMsg(
                    "Database",
                    tryDatabaseLoad as object,
                    objOfTypeT as object
                )
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

        if (!result.cacheFinished && !noCache) {
            await this.cache.get("fake", true);
        }
        return returnResultOrError(result);
    }

    async getAll<T extends object>(id: string, objOfTypeT: T, field?: string) {
        // Get all from database
        const tryDatabaseLoad = await this.database.get(
            id,
            objOfTypeT,
            field,
            true
        );

        // Return if error / null
        if (!tryDatabaseLoad || tryDatabaseLoad instanceof Error)
            return tryDatabaseLoad;

        if (!Array.isArray(tryDatabaseLoad))
            return new Error("Database did not return an array");

        // Return if array empty
        if (tryDatabaseLoad.length == 0) return tryDatabaseLoad;

        // Return if array just contains null
        if (!tryDatabaseLoad[0]) return null;

        // Check type of object returned
        if (!isT<T>(tryDatabaseLoad[0], objOfTypeT)) {
            return new Error(
                formatObjectMismatchErrorMsg(
                    "Database",
                    tryDatabaseLoad[0] as object,
                    objOfTypeT as object
                )
            );
        }

        // Success, return
        return tryDatabaseLoad;
    }
    async delete<T extends object>(
        ids: string | string[],
        objOfTypeT: T,
        field: string = "uniqueId"
    ): Promise<string[] | null | Error> {
        // Create promises
        let toBeExecuted: Promise<Error | string[] | null>[];
        if (!Array.isArray(ids) || (Array.isArray(ids) && ids.length === 1)) {
            const id = Array.isArray(ids) ? ids[0] : ids;
            toBeExecuted = [
                this.database.delete(id, objOfTypeT, field),
                this.cache.delete(id),
            ];
        } else {
            toBeExecuted = [
                this.database.delete(ids, objOfTypeT, field),
            ].concat(ids.map((id) => this.cache.delete(id)));
        }

        // Return result or error
        const deleteResult = await Promise.all(toBeExecuted);
        return deleteResult[0];
    }
}
