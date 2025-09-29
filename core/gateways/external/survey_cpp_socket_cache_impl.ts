import { SurveyCache } from "../interfaces/external/survey_cache";
import { CacheGateway } from "@cache_gateway/ts/cache_gateway";

export class SurveyCacheImpl implements SurveyCache {
    private cacheGateway: CacheGateway;

    constructor(cacheGateway: CacheGateway) {
        this.cacheGateway = cacheGateway;
    }

    async saveSurvey(uniqueId: string, survey: string): Promise<null | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        return await this.cacheGateway.create(uniqueId, survey);
    }

    async loadSurveyFromCache(uniqueId: string): Promise<string> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error)
            return JSON.stringify(didCacheConnect);

        const didCacheRead = await this.cacheGateway.read(uniqueId);
        if (didCacheRead instanceof Error) return JSON.stringify(didCacheRead);
        return didCacheRead;
    }
}
