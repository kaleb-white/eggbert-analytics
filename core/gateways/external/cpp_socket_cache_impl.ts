import { Cache } from "../interfaces/external/cache";
import { CacheGateway } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway";

export class CacheImpl implements Cache {
    private cacheGateway: CacheGateway;

    constructor(cacheGateway: CacheGateway) {
        this.cacheGateway = cacheGateway;
    }

    async save(
        uniqueId: string,
        obj: object,
        isLastCacheInteraction: boolean = false
    ): Promise<null | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        const res = this.cacheGateway.create(
            uniqueId,
            JSON.stringify(obj),
            isLastCacheInteraction
        );
        return res;
    }

    async get<T>(
        uniqueId: string,
        isLastCacheInteraction: boolean = false
    ): Promise<T | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        const didCacheRead = await this.cacheGateway.read(
            uniqueId,
            isLastCacheInteraction
        );
        if (didCacheRead instanceof Error) return didCacheRead;
        return JSON.parse(didCacheRead) as T;
    }

    async delete(
        uniqueId: string,
        isLastCacheInteraction: boolean = false
    ): Promise<null | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        const didCacheDelete = await this.cacheGateway.delete(
            uniqueId,
            isLastCacheInteraction
        );
        return didCacheDelete;
    }
}
