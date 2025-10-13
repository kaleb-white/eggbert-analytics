import { SurveyDatabase } from "../interfaces/external/survey_database";
import { executeStatements } from "@/persistent_storage/postgres_db/execution_utilities";
import { Survey } from "@/core/entities/surveys/survey";
import {
    getSurveyWithoutResponses,
    getSurveyWithResponses,
    saveOrUpdateSurvey,
} from "@/persistent_storage/postgres_db/sql_generators_by_entity/survey";
import { getFirstEntity } from "@/persistent_storage/postgres_db/generation_types_and_utilities";
import { Pool } from "pg";

export class SurveyPostgresDbImpl implements SurveyDatabase {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async saveSurvey(survey: Survey): Promise<null | Error> {
        const statementsThatSaveSurvey = saveOrUpdateSurvey(survey);
        const saveResult = await executeStatements(
            statementsThatSaveSurvey,
            this.pool
        );
        if (saveResult instanceof Error) return saveResult;
        return null;
    }
    async loadSurveyWithResponsesFromDb(
        uniqueId: string
    ): Promise<Survey | Error> {
        const statementsThatRetrieveSurvey =
            getSurveyWithoutResponses(uniqueId);
        const loadResult = await executeStatements(
            statementsThatRetrieveSurvey,
            this.pool
        );
        if (loadResult instanceof Error) return loadResult;
        const surveyOrError = getFirstEntity<Survey>(loadResult);
        return surveyOrError;
    }

    async loadSurveyWithoutResponsesFromDb(
        uniqueId: string
    ): Promise<Survey | Error> {
        const statementsThatRetrieveSurvey = getSurveyWithResponses(uniqueId);
        const loadResult = await executeStatements(
            statementsThatRetrieveSurvey,
            this.pool
        );
        if (loadResult instanceof Error) return loadResult;
        const surveyOrError = getFirstEntity<Survey>(loadResult, "surveyAgg");
        return surveyOrError;
    }
}
