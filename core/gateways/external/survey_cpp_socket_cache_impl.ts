import { Survey } from "@/core/entities/surveys/survey";
import { SurveyCache } from "../interfaces/external/survey_cache";
import { CacheGateway } from "@cache_gateway/ts/cache_gateway";

export class SurveyCacheImpl implements SurveyCache {
    private cacheGateway: CacheGateway;

    constructor(cacheGateway: CacheGateway) {
        this.cacheGateway = cacheGateway;
    }

    async saveSurvey(survey: Survey): Promise<null | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        return await this.cacheGateway.create(
            survey.uniqueId,
            JSON.stringify(survey)
        );
    }

    async loadSurveyFromCache(uniqueId: string): Promise<Survey | Error> {
        const didCacheConnect = await this.cacheGateway.connect();
        if (didCacheConnect instanceof Error) return didCacheConnect;

        const didCacheRead = await this.cacheGateway.read(uniqueId);
        if (didCacheRead instanceof Error) return didCacheRead;
        return JSON.parse(didCacheRead) as Survey;
    }
}
