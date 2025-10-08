import { QueryResult } from "pg";
import { SurveyDatabase } from "../interfaces/external/survey_database";
import { executeStatements } from "@/persistent_storage/postgres_db/execution_utilities";
import pool from "@/persistent_storage/postgres_db/pool";

export class SurveyPostgresDbImpl implements SurveyDatabase {
    async saveSurvey(uniqueId: string, survey: string): Promise<null | Error> {
        return null;
    }
    loadSurveyWithResponsesFromDb(uniqueId: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    loadSurveyWithoutResponsesFromDb(uniqueId: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
