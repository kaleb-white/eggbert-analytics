import { Pool, QueryResult } from "pg";
import {
    PossibleStatementFormat,
    ParameterizedStatement,
    ParameterizedStatementSets,
} from "./generation_types_and_utilities";
import { db_debug } from "@/stable_utilities/verbose_checks";
import { formatSql } from "@/tests/db/utilities/sql_formatter";

export function createPromisesFromStatementSet(
    statementSet: PossibleStatementFormat[],
    pool: Pool
): Promise<QueryResult>[] {
    const promises: Promise<QueryResult>[] = [];
    for (const statement of statementSet) {
        if (statement == "pass") continue;
        if (db_debug()) {
            console.log(
                "Executing sql:\n",
                formatSql((statement as ParameterizedStatement).sql),
                "with user input",
                (statement as ParameterizedStatement).userInput
            );
        }
        promises.push(
            pool.query(
                (statement as ParameterizedStatement).sql,
                (statement as ParameterizedStatement).userInput
            )
        );
    }
    return promises;
}

/**
 * Executes either sets of queries concurrently or individual queries in the order which it encounters them in the sqlStatements argument.
 * Catches errors and returns them, or returns null on success.
 * @param sqlStatements A set of 'Parameterized Statement Sets', which is an array of arrays or individual statements.
 * @param pool A pool to use to query the database.
 */
export async function executeStatements(
    sqlStatements: ParameterizedStatementSets,
    pool: Pool
): Promise<QueryResult[] | Error> {
    const result: QueryResult[] = [];
    for (const statementSet of sqlStatements) {
        // If is array: execute all promises at same time
        if (Array.isArray(statementSet)) {
            const promises = createPromisesFromStatementSet(statementSet, pool);
            try {
                const results = await Promise.all(promises);
                if (db_debug()) {
                    console.log(
                        "First three rows in result: \n",
                        results.flatMap((res) => res.rows).slice(0, 3)
                    );
                }
                result.concat(results);
            } catch (err) {
                return err as Error;
            }
        } else {
            if (db_debug()) {
                console.log(
                    "Executing sql:\n",
                    formatSql((statementSet as ParameterizedStatement).sql),
                    "with user input",
                    (statementSet as ParameterizedStatement).userInput
                );
            }
            try {
                const queryResult = await pool.query(
                    (statementSet as ParameterizedStatement).sql,
                    (statementSet as ParameterizedStatement).userInput
                );
                if (db_debug()) {
                    console.log(
                        "First three rows in result: \n",
                        queryResult.rows.slice(0, 3)
                    );
                }
                result.push(queryResult);
            } catch (err) {
                return err as Error;
            }
        }
    }
    return result;
}
