import { QueryResult } from "pg";
import { SurveyDatabase } from "../../interfaces/external/survey_database";
import { surveySqlGenerator } from "../../../../persistent_storage/postgres_db/survey_sql_generator";
import pool from "@pool";
import {
    PossibleStatementFormat,
    ParameterizedStatement,
} from "../../../../persistent_storage/postgres_db/generation_types_and_utilities";

function createPromisesFromStatementSet(
    statementSet: PossibleStatementFormat[]
): Promise<QueryResult>[] {
    const promises: Promise<QueryResult>[] = [];
    for (const statement of statementSet) {
        if (statement instanceof String) {
            promises.push(pool.query(statement as string));
        } else {
            promises.push(
                pool.query(
                    (statement as ParameterizedStatement).sql,
                    (statement as ParameterizedStatement).userInput
                )
            );
        }
    }
    return promises;
}

export class SurveyPostgresDbImpl implements SurveyDatabase {
    async saveSurvey(uniqueId: string, survey: string): Promise<null | Error> {
        const sqlStatements = surveySqlGenerator.saveOrUpdateSurvey(
            JSON.parse(survey)
        );
        for (const statementSet of sqlStatements) {
            // If is array: execute all promises at same time
            if (Array.isArray(statementSet)) {
                const promises = createPromisesFromStatementSet(statementSet);
                const saveResults = await Promise.all(promises);
                console.log(JSON.stringify(saveResults));
            } else {
                await pool.query(statementSet as string);
            }
        }
        return null;
    }
    loadSurveyWithResponsesFromDb(uniqueId: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    loadSurveyWithoutResponsesFromDb(uniqueId: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
