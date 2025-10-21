/* eslint-disable @typescript-eslint/no-explicit-any */
import { isT } from "@/stable_utilities/global_type_check";
import { Cache } from "../interfaces/external/cache";
import { Database } from "../interfaces/external/database";
import { StorageGateway } from "../interfaces/internal/survey_storage_gateway";

export class StorageGatewayImpl implements StorageGateway {
    private cache: Cache;
    private database: Database;

    constructor(cache: Cache, database: Database) {
        this.cache = cache;
        this.database = database;
    }

    async save(id: string, obj: any): Promise<null | Error> {
        const toBeExecuted = [
            this.cache.save(id, obj),
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
        const tryCacheLoad = await this.cache.get(id);
        if (
            !(tryCacheLoad instanceof Error) &&
            isT<T>(tryCacheLoad, objOfTypeT)
        ) {
            return tryCacheLoad as T;
        }
        if (
            !(tryCacheLoad instanceof Error) &&
            !isT<T>(tryCacheLoad, objOfTypeT)
        )
            return new Error(
                "Cache returned something that wasn't of type T or an error!"
            );

        const tryDatabaseLoad = await this.database.get<T>(id, objOfTypeT);

        if (
            !(tryDatabaseLoad instanceof Error) &&
            isT<T>(tryDatabaseLoad, objOfTypeT)
        ) {
            this.cache.save(id, tryDatabaseLoad as object);
            return tryDatabaseLoad as T;
        }
        if (
            !(tryDatabaseLoad instanceof Error) &&
            !isT<T>(tryDatabaseLoad, objOfTypeT)
        )
            return new Error(
                "Database returned something that wasn't of type T or an error!"
            );

        return null;
    }
}
