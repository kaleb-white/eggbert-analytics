import { SurveyDataGateway } from "@/core/use_cases/surveys/interfaces/survey_data_gateway";
import { SurveyCache } from "./interfaces/survey_cache";
import { SurveyDatabase } from "./interfaces/survey_database";
import { Survey } from "@/core/entities/surveys/survey";
import { SurveyResponse } from "@/core/entities/surveys/survey_response";
import { isSurvey } from "@/stable_utilities/type_checks";

export class SurveyDataGatewayImpl implements SurveyDataGateway {
    private cache: SurveyCache;
    private database: SurveyDatabase;

    constructor(cache: SurveyCache, database: SurveyDatabase) {
        this.cache = cache;
        this.database = database;
    }

    async saveSurvey(survey: Survey): Promise<null | Error> {
        const tryCacheSave = this.cache.saveSurvey(
            survey.uniqueid,
            JSON.stringify(survey)
        );
        const tryDbSave = this.database.saveSurvey(
            survey.uniqueid,
            JSON.stringify(survey)
        );

        if (tryCacheSave instanceof Error && tryDbSave instanceof Error)
            return new Error(
                `Failed to save to cache or db. Cache failure message was ${tryCacheSave.message}. Db failure message was ${tryDbSave.message}`
            );
        if (tryDbSave instanceof Error) return tryDbSave;

        return null;
    }

    async loadSurveyWithResponses(uniqueId: string): Promise<Survey | Error> {
        const tryCacheLoad = JSON.parse(
            await this.cache.loadSurveyFromCache(uniqueId)
        );

        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad)) {
            return tryCacheLoad as Survey;
        }
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad = JSON.parse(
            await this.database.loadSurveyWithResponsesFromDb(uniqueId)
        );

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad)) {
            this.tryCacheSave(tryDatabaseLoad as Survey);
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
        const tryCacheLoad = JSON.parse(
            await this.cache.loadSurveyFromCache(uniqueId)
        );

        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad)) {
            (tryCacheLoad as Survey).surveyResponses = [];
            return tryCacheLoad as Survey;
        }
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad = JSON.parse(
            await this.database.loadSurveyWithoutResponsesFromDb(uniqueId)
        );

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad)) {
            this.tryCacheSave(tryDatabaseLoad as Survey);
            return tryDatabaseLoad as Survey;
        }
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }

    async loadSurveyResponses(
        uniqueId: string
    ): Promise<SurveyResponse[] | Error> {
        const tryCacheLoad = JSON.parse(
            await this.cache.loadSurveyFromCache(uniqueId)
        );

        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad))
            return (tryCacheLoad as Survey).surveyResponses;
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad = JSON.parse(
            await this.database.loadSurveyWithResponsesFromDb(uniqueId)
        );

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad))
            return (tryDatabaseLoad as Survey).surveyResponses;
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }

    private tryCacheSave(survey: Survey) {
        this.cache.saveSurveyAsynchronously(
            survey.uniqueid,
            JSON.stringify(survey)
        );
    }
}
