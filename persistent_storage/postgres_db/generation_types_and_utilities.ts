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

export function argumentsToInStatementFromArray(tsArr: RequiredUniqueId[]) {
    return "("
        .concat(tsArr.map((obj) => `'${obj.uniqueId}'`).join(","))
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

export function jsonbObjToEntity<T>(jsonbObj: object): T | Error {
    if (!Object.keys(jsonbObj).includes("jsonb_build_object"))
        return new Error(
            "While reconstructing entity from query, query did not contain a jsonb object"
        );
    return jsonbObj["jsonb_build_object"] as T;
}

export function getFirstEntity<T>(queryResults: QueryResult[]): T | Error {
    if (queryResults.length == 0 || queryResults[0].rows.length == 0)
        return new Error("Query did not contain a result");
    return jsonbObjToEntity<T>(queryResults[0].rows[0]);
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
    additionalJoins: string,
    whereStatement: string = `WHERE ${oneManyTableName}.${oneIdName} = $1`,
    as: string = oneManyTableName
) {
    return `LEFT JOIN (
                SELECT ${oneManyTableName}.${oneIdName}, ${jsonbFunction()}
                    FROM ${oneManyTableName}
                    JOIN ${manyTableName} ON ${oneManyTableName}.${manyIdName} = ${manyTableName}.uniqueId
                    ${additionalJoins}
                    ${whereStatement}
                    GROUP BY ${oneManyTableName}.${oneIdName}
            ) ${as} ON ${oneTableName}.uniqueId = ${as}.surveyId`;
}
