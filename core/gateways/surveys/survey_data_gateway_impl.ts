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

    loadSurveyWithResponses(uniqueId: string): Survey | Error {
        const tryCacheLoad = JSON.parse(
            this.cache.loadSurveyWithResponsesFromCache(uniqueId)
        );

        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad))
            return tryCacheLoad as Survey;
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad = JSON.parse(
            this.database.loadSurveyWithResponsesFromDb(uniqueId)
        );

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad))
            return tryDatabaseLoad as Survey;
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }

    loadSurveyWithoutResponses(uniqueId: string): Survey | Error {
        const tryCacheLoad = JSON.parse(
            this.cache.loadSurveyWithoutResponsesFromCache(uniqueId)
        );

        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad))
            return tryCacheLoad as Survey;
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad = JSON.parse(
            this.database.loadSurveyWithoutResponsesFromDb(uniqueId)
        );

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad))
            return tryDatabaseLoad as Survey;
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }

    loadSurveyResponses(uniqueId: string): SurveyResponse[] | Error {
        const tryCacheLoad = JSON.parse(
            this.cache.loadSurveyWithResponsesFromCache(uniqueId)
        );

        if (!(tryCacheLoad instanceof Error) && isSurvey(tryCacheLoad))
            return (tryCacheLoad as Survey).surveyResponses;
        if (!(tryCacheLoad instanceof Error) && !isSurvey(tryCacheLoad))
            return new Error(
                "Cache returned something that wasn't a survey or an error!"
            );

        const tryDatabaseLoad = JSON.parse(
            this.database.loadSurveyWithResponsesFromDb(uniqueId)
        );

        if (!(tryDatabaseLoad instanceof Error) && isSurvey(tryDatabaseLoad))
            return (tryDatabaseLoad as Survey).surveyResponses;
        if (!(tryDatabaseLoad instanceof Error) && !isSurvey(tryDatabaseLoad))
            return new Error(
                "Database returned something that wasn't a survey or an error!"
            );

        return new Error("No record found");
    }
}
