import { SurveyCache } from "../interfaces/external/survey_cache";
import { SurveyDatabase } from "../interfaces/external/survey_database";
import { Survey } from "@entities/surveys/survey";
import { Response } from "@entities/surveys/response";
import { isSurvey } from "@/stable_utilities/type_checks";
import { SurveyStorageGateway } from "../interfaces/internal/survey_storage_gateway";

export class SurveyStorageGatewayImpl implements SurveyStorageGateway {
    private cache: SurveyCache;
    private database: SurveyDatabase;

    constructor(cache: SurveyCache, database: SurveyDatabase) {
        this.cache = cache;
        this.database = database;
    }

    async saveSurvey(survey: Survey): Promise<null | Error> {
        const toBeExecuted = [
            this.cache.saveSurvey(survey),
            this.database.saveSurvey(survey),
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

    async loadSurveyWithResponses(uniqueId: string): Promise<Survey | Error> {
        const tryCacheLoad = await this.cache.loadSurveyFromCache(uniqueId);
        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad)) {
            return tryCacheLoad as Survey;
        }
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad =
            await this.database.loadSurveyWithResponsesFromDb(uniqueId);

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad)) {
            this.cache.saveSurvey(tryDatabaseLoad as Survey);
            return tryDatabaseLoad as Survey;
        }
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }

    async loadSurveyWithoutResponses(
        uniqueId: string
    ): Promise<Survey | Error> {
        const tryCacheLoad = await this.cache.loadSurveyFromCache(uniqueId);
        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad)) {
            (tryCacheLoad as Survey).responses = [];
            return tryCacheLoad as Survey;
        }
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad =
            await this.database.loadSurveyWithoutResponsesFromDb(uniqueId);

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad)) {
            this.cache.saveSurvey(tryDatabaseLoad as Survey);
            return tryDatabaseLoad as Survey;
        }
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }

    async loadResponses(uniqueId: string): Promise<Response[] | Error> {
        const tryCacheLoad = await this.cache.loadSurveyFromCache(uniqueId);
        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad))
            return (tryCacheLoad as Survey).responses;
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad =
            await this.database.loadSurveyWithResponsesFromDb(uniqueId);
        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad))
            return (tryDatabaseLoad as Survey).responses;
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }
}
