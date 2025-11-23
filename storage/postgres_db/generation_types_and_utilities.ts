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

/**
 *
 * @param numCols The total number of columns. For example, if an entity has two fields (`name`, `email`), then numCols would be 2.
 * @param numParameters The total number of parameters. For example, say there are three entities which are being inserted, and each entity has two fields, then numParameters would be 6.
 * @returns
 */
export function createParameterizedStatement(
    numCols: number,
    numParameters: number
) {
    let stringResult = "(";
    for (let i = 1; i <= numParameters; i++) {
        stringResult = stringResult.concat(`$${i}`);

        if (i == numParameters) {
            stringResult = stringResult.concat(`)`);
        } else if (i % numCols == 0) {
            stringResult = stringResult.concat(`), (`);
        } else {
            stringResult = stringResult.concat(`,`);
        }
    }
    return stringResult;
}

export function getAllEntityValuesAsArray(
    entities: object[],
    orderedFields: (string | string[])[]
) {
    if (entities.length == 0) return null;
    return entities.flatMap((entity) =>
        orderedFields.map((field) => {
            if (Array.isArray(field)) {
                let subObj = entity;
                for (const subField of field) {
                    subObj = subObj[subField];
                }
                return subObj;
            }
            return entity[field];
        })
    );
}

/**
 * Does not type check T, just casts the found entities to T.
 * Assumes that the results look something like `[{\"sessionsagg\":[{\"role\":\"anonymous\",\"userId\":\"user\",\"uniqueId\":\"1\",\"expiration\":1766508077928,\"antiCsrfToken\":\"\"}]}]`,
 *  a single row object with a single or aggregated json object.
 * @param queryResult A single QueryResult object, from the pg module.
 */
export function getAllEntitiesFromOneResult<T>(
    queryResult: QueryResult
): T[] | Error | null {
    if (queryResult.rows.length == 0 || !queryResult) return null;
    const aggOrObjName = Object.keys(queryResult.rows[0])[0];
    if (!aggOrObjName)
        return new Error(
            `Query returned a table with column names ${Object.keys(
                queryResult.rows[0]
            )}. Trying to access the first member resulted in undefined.`
        );

    const entities = queryResult.rows[0][aggOrObjName];
    if (Array.isArray(entities)) return entities as T[];
    else return [entities];
}

/**
 * Does not type check T, just casts the found entities to T.
 * @param queryResult A single QueryResult object, from the pg module.
 * @returns The first entity found.
 */
export function getFirstEntityFromOneResult<T>(
    queryResult: QueryResult
): T | Error | null {
    const allEntities = getAllEntitiesFromOneResult<T>(queryResult);
    if (!allEntities || allEntities instanceof Error) return allEntities;
    else return allEntities[0];
}

/**
 * Does not type check T, just casts the found entities to T.
 * @param queryResults Multiple QueryResult objects, from the pg module. Usually the result of a call to `executeStatements`.
 * @returns The first entity found or an error.
 */
export function getFirstEntity<T>(
    queryResults: QueryResult[]
): T | Error | null {
    if (queryResults.length == 0)
        return new Error("No query results passed when getting first entity");
    return getFirstEntityFromOneResult<T>(queryResults[0]);
}

/**
 * Does not type check T, just casts the found entities to T.
 * DO NOT include any column that is not the aggregation name in the select statement.
 * @param queryResults Multiple QueryResult objects, from the pg module. Usually the result of a call to `executeStatements`.
 * @returns All entities found or an error.
 */
export function getAllEntities<T>(
    queryResults: QueryResult[]
): T[] | Error | null {
    let entityFailed: Error | null = null;
    let allEntities: T[] = [];

    queryResults.forEach((queryResult) => {
        const oneResultEntities = getAllEntitiesFromOneResult<T>(queryResult);
        if (!oneResultEntities || oneResultEntities instanceof Error) {
            entityFailed = oneResultEntities;
        } else {
            allEntities = allEntities.concat(oneResultEntities);
        }
    });

    if (entityFailed) return entityFailed;
    return allEntities;
}

/**
 * @param childTableName The child table name. For example, `questions`.
 * @param parentIdNameInChildTable The name of the parent id in the child table. For example, `surveyId`.
 * @param parentTableName The parent table name. For example, `surveys`.
 * @param jsonbFunction The function to create the jsonb entities. For example, `createJsonbQuestion`.
 * @param as The name of the newly created table which contains the jsonb.
 * @param parentIdName The name of the field in the parent table which corresponds to parentIdName in child table. For example, in the `questionResponses` table, when joining the corresponding question, it is `questions`. Defaults to `uniqueId`.
 * @param additionalJoins Any necessary additional joins in order to complete the jsonb object.
 */
export function createLeftJoin(
    childTableName: string,
    parentIdNameInChildTable: string,
    parentTableName: string,
    jsonbFunction: (as?: string) => string,
    as: string,
    parentIdName: string = "uniqueId",
    aggregation: boolean = false,
    additionalJoins: string = " "
) {
    return `LEFT JOIN (
                SELECT ${childTableName}.${parentIdNameInChildTable}, ${jsonbFunction()}
                    FROM ${childTableName}
                    ${additionalJoins}
                    ${
                        aggregation
                            ? `GROUP BY ${childTableName}.${parentIdNameInChildTable}`
                            : ""
                    }
            ) ${as} ON ${as}.${parentIdNameInChildTable} = ${parentTableName}.${parentIdName}

            `;
}
