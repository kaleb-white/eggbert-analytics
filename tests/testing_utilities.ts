import {
    ParameterizedStatementSets,
    ParameterizedStatement,
    PossibleStatementFormat,
} from "@/storage/postgres_db/generation_types_and_utilities";

export function truncateSql(sql: string): string {
    return sql.replace(/\t/g, "").replace(/\n/g, "").replace(/ /g, "");
}

function truncateParameterizedStatementOrString(
    statement: PossibleStatementFormat
) {
    if (typeof statement == "string") {
        return truncateSql(statement as string);
    } else {
        (statement as ParameterizedStatement).sql = truncateSql(
            (statement as ParameterizedStatement).sql
        );
        return statement;
    }
}

export function truncateAll(
    orderedParamterizedStatements: ParameterizedStatementSets
) {
    return orderedParamterizedStatements.map((statements) => {
        if (Array.isArray(statements)) {
            return statements.map((statement) =>
                truncateParameterizedStatementOrString(statement)
            );
        }
        return truncateParameterizedStatementOrString(statements);
    });
}

export function truncateAllAndStringify(
    orderedParamterizedStatements: ParameterizedStatementSets
) {
    return JSON.stringify(truncateAll(orderedParamterizedStatements));
}

export function logDiff(betweenThisString: string, andThisString: string) {
    let diff = "";
    let i = 0;
    while (
        i <
        (betweenThisString.length < andThisString.length
            ? betweenThisString.length
            : andThisString.length)
    ) {
        if (betweenThisString[i] != andThisString[i]) {
            diff = diff.concat(betweenThisString[i]);
        }
        i++;
    }
    console.log(diff);
}

export function repeatArrayNTimes<T>(array: Array<T>, n: number): Array<T> {
    let i = 0;
    const unflattenedOutput: Array<Array<T>> = [];
    while (i < n) {
        unflattenedOutput.push(array);
        i++;
    }
    return unflattenedOutput.flat();
}
