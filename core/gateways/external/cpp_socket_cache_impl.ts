import { Cache } from "../interfaces/external/cache";
import { CacheGateway } from "@cache_gateway/ts/cache_gateway";

export class CacheImpl implements Cache {
    private cacheGateway: CacheGateway;

    constructor(cacheGateway: CacheGateway) {
        this.cacheGateway = cacheGateway;
    }

    async save(uniqueId: string, obj: object): Promise<null | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        return await this.cacheGateway.create(uniqueId, JSON.stringify(obj));
    }

    async get<T>(uniqueId: string): Promise<T | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        const didCacheRead = await this.cacheGateway.read(uniqueId);
        if (didCacheRead instanceof Error) return didCacheRead;
        return JSON.parse(didCacheRead) as T;
    }
}
