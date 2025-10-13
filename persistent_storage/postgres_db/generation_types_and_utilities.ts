import { QueryResult } from "pg";

export type RequiredUniqueId = {
    uniqueId: string;
};

export type ParameterizedStatement = {
    sql: string;
    userInput: string[];
};

export type PossibleStatementFormat = ParameterizedStatement | "pass";

/**
 *  An array indicates concurrency is acceptable.
 *  SQL statements or prepared statements should be ordered by the sequence in which they should be run.
 */
export type ParameterizedStatementSets = (
    | PossibleStatementFormat[]
    | PossibleStatementFormat
)[];

export function createParameterizedStatement(
    numRows: number,
    numParameters: number,
    timestampFieldIndices: number[] = []
) {
    let stringResult = "(";
    for (let i = 1; i <= numParameters; i++) {
        if (timestampFieldIndices.includes((i - 1) % numRows)) {
            stringResult = stringResult.concat(`to_timestamp($${i})`);
        } else {
            stringResult = stringResult.concat(`$${i}`);
        }

        if (i == numParameters) {
            stringResult = stringResult.concat(`)`);
        } else if (i % numRows == 0) {
            stringResult = stringResult.concat(`), (`);
        } else {
            stringResult = stringResult.concat(`,`);
        }
    }
    return stringResult;
}

export function joinTablesWhereUniqueIdMatchesCol(
    tableWithUniqueIdCol: string,
    tableWithSpecificCol: string,
    col: string
) {
    return `
    JOIN ${tableWithUniqueIdCol} ON ${tableWithUniqueIdCol}.uniqueId = ${tableWithSpecificCol}.${col}
    `;
}

export function argumentsToInStatementFromArray(uniqueIds: string[]) {
    return "("
        .concat(uniqueIds.map((uniqueId) => `'${uniqueId}'`).join(","))
        .concat(")");
}

export function jsDateToSqlTimestamp(date: number) {
    return `${Math.floor(date / 1000)}`;
}

export function getAllEntityValuesAsArray(
    entities: object[],
    orderedFields: (string | string[])[],
    timestampFieldIndices: number[] = []
) {
    if (entities.length == 0) return null;
    return entities.flatMap((entity) =>
        orderedFields.map((field, i) => {
            if (Array.isArray(field)) {
                let subObj = entity;
                for (const subField of field) {
                    subObj = subObj[subField];
                }
                return subObj;
            }
            if (timestampFieldIndices.includes(i)) {
                return jsDateToSqlTimestamp(entity[field] as number);
            }
            return entity[field];
        })
    );
}

/**
 * Does not type check T, just casts the found entities to T.
 * @param queryResult A single QueryResult object, from the pg module.
 * @param expectedAggregationName The expected aggregation name, if any. For exmaple, `turnsAgg`. Returns an error if incorrect. Both the expected aggregation name and the found aggregation name are lowercased. Defaults to "jsonb_build_object", which, if one object, not an aggregation, is the result of the 'get', will likely be the column name.
 * @returns An error or an array of type T.
 */
export function getAllEntitiesFromOneResult<T>(
    queryResult: QueryResult,
    expectedAggregationName: string = "jsonb_build_object"
): T[] | Error {
    if (queryResult.rows.length == 0)
        return new Error("Query contained no results");
    const columnNames = Object.keys(queryResult.rows[0]);
    if (
        expectedAggregationName != "jsonb_build_object" &&
        !columnNames.includes(expectedAggregationName.toLowerCase())
    ) {
        return new Error(
            `Query returned a column with column names ${columnNames.join(
                ", "
            )}, when the expected name was ${expectedAggregationName}`
        );
    }

    const entities = queryResult.rows[0][expectedAggregationName];
    if (Array.isArray(entities)) return entities as T[];
    else return [entities];
}

/**
 * Does not type check T, just casts the found entities to T.
 * @param queryResult A single QueryResult object, from the pg module.
 * @param expectedAggregationName The expected aggregation name, if any. For exmaple, `turnsAgg`. Returns an error if incorrect. Both the expected aggregation name and the found aggregation name are lowercased. Defaults to "jsonb_build_object", which, if one object, not an aggregation, is the result of the 'get', will likely be the column name.
 * @returns The first entity found.
 */
export function getFirstEntityFromOneResult<T>(
    queryResult: QueryResult,
    expectedAggregationName = "jsonb_build_object"
): T | Error {
    const allEntities = getAllEntitiesFromOneResult<T>(
        queryResult,
        expectedAggregationName
    );
    if (allEntities instanceof Error) return allEntities;
    else return allEntities[0];
}

/**
 * Does not type check T, just casts the found entities to T.
 * @param queryResults Multiple QueryResult objects, from the pg module. Usually the result of a call to `executeStatements`.
 * @param expectedAggregationName The expected aggregation name, if any. For exmaple, `turnsAgg`. Returns an error if incorrect. Both the expected aggregation name and the found aggregation name are lowercased. Defaults to "jsonb_build_object", which, if one object, not an aggregation, is the result of the 'get', will likely be the column name.
 * @returns The first entity found or an error.
 */
export function getFirstEntity<T>(
    queryResults: QueryResult[],
    expectedAggregationName = "jsonb_build_object"
): T | Error {
    if (queryResults.length == 0)
        return new Error("No query results passed when getting first entity");
    return getFirstEntityFromOneResult<T>(
        queryResults[0],
        expectedAggregationName
    );
}

/**
 * Does not type check T, just casts the found entities to T.
 * DO NOT include any column that is not the aggregation name in the select statement.
 * @param queryResults Multiple QueryResult objects, from the pg module. Usually the result of a call to `executeStatements`.
 * @param expectedAggregationName The expected aggregation name, if any. For exmaple, `turnsAgg`. Returns an error if incorrect. Both the expected aggregation name and the found aggregation name are lowercased. Defaults to "jsonb_build_object", which, if one object, not an aggregation, is the result of the 'get', will likely be the column name.
 * @returns All entities found or an error.
 */
export function getAllEntities<T>(
    queryResults: QueryResult[],
    expectedAggregationName: string = "jsonb_build_object"
): T[] | Error {
    let entityFailed: Error | null = null;
    let allEntities: T[] = [];

    queryResults.forEach((queryResult) => {
        const oneResultEntities = getAllEntitiesFromOneResult<T>(
            queryResult,
            expectedAggregationName
        );
        if (oneResultEntities instanceof Error) {
            entityFailed = oneResultEntities;
        } else {
            allEntities = allEntities.concat(oneResultEntities);
        }
    });

    if (entityFailed) return entityFailed;
    return allEntities;
}

/**
 *
 * @param oneTableName The name of the of parent table, for example `surveys`.
 * @param manyTableName The name of the child table, for example `questions`.
 * @param oneManyTableName The name of the one-many table, for example `surveysQuestions`.
 * @param oneIdName The name of the parent id in the oneManyTable, for example `surveyId`.
 * @param manyIdName The name of the child id in the oneManyTable, for example `questionId`.
 * @param jsonbFunction Function to create jsonb agg from the joined many table, for example `createJsonbQuestions()`.
 * @param additionalJoins Additional left join statements to add. Placed before the WHERE clause and after the JOIN clause.
 * @param whereStatement The statement to filter the one-many table on, for example `WHERE surveysQuestions.surveyId = $1`.
 * @param as The name of the table created within the left join statement, for example `LEFT JOIN (...) sq ON surveys.uniqueId = sq.surveyId`.
 */
export function createLeftJoin(
    oneTableName: string,
    manyTableName: string,
    oneManyTableName: string,
    oneIdName: string,
    manyIdName: string,
    jsonbFunction: (as?: string) => string,
    as: string = oneManyTableName,
    additionalJoins: string = " "
) {
    return `LEFT JOIN (
                SELECT ${oneManyTableName}.${oneIdName}, ${jsonbFunction()}
                    FROM ${oneManyTableName}
                    JOIN ${manyTableName} ON ${oneManyTableName}.${manyIdName} = ${manyTableName}.uniqueId
                    ${additionalJoins}
                    GROUP BY ${oneManyTableName}.${oneIdName}
            ) ${as} ON ${oneTableName}.uniqueId = ${as}.${oneIdName}`;
}
