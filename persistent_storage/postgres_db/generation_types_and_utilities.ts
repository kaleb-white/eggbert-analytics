export type RequiredUniqueId = {
    uniqueId: string;
};

export type ParameterizedStatement = {
    isParameterizedStatement: boolean;
    sql: string;
    userInput: string[];
};

export type PossibleStatementFormat = string | ParameterizedStatement | "pass";

/**
 *  An array indicates concurrency is acceptable.
 *  SQL statements or prepared statements should be ordered by the sequence in which they should be run.
 */
export type OrderedParameterizedStatementsAndRawSQL = (
    | PossibleStatementFormat[]
    | PossibleStatementFormat
)[];

export function createParameterizedStatementWithInjectedValues(
    numRows: number,
    parametersAsStringsLength: number
) {
    let stringResult = "(";
    for (let i = 1; i <= parametersAsStringsLength; i++) {
        if (i == parametersAsStringsLength) {
            stringResult = stringResult.concat(`$${i})`);
        } else if (i % numRows == 0) {
            stringResult = stringResult.concat(`$${i}), (`);
        } else {
            stringResult = stringResult.concat(`$${i},`);
        }
    }
    return stringResult;
}

export function joinTablesWhereUniqueIdMatchesCol(
    tableWithUniqueIdCol: string,
    tableWithSpecificCol: string,
    col: string
): PossibleStatementFormat {
    return `
    JOIN ${tableWithUniqueIdCol} ON ${tableWithUniqueIdCol}.uniqueId = ${tableWithSpecificCol}.${col}
    `;
}

export function argumentsToInStatementFromArray(tsArr: RequiredUniqueId[]) {
    return "("
        .concat(tsArr.map((obj) => `'${obj.uniqueId}'`).join(","))
        .concat(")");
}
