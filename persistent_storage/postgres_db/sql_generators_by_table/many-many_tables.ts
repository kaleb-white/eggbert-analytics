import { PossibleStatementFormat } from "../generation_types_and_utilities";

type RequiredUniqueId = {
    uniqueId: string;
};

function getAllValues(
    valuesFirst: Array<RequiredUniqueId>,
    valuesSecond: Array<RequiredUniqueId>
) {
    if (valuesFirst.length != valuesSecond.length)
        throw new Error(
            `While creating an SQL statement for a many-many table, arrays had different length: array 1 had length ${valuesFirst.length}, array 2 had length ${valuesSecond.length}`
        );

    return valuesFirst
        .map((val, i) => `('${val.uniqueId}', '${valuesSecond[i].uniqueId}')`)
        .join(",");
}

export function insertOrUpdateManyManyRelation(
    columnNameFirst: string,
    columnNameSecond: string,
    tableName: string,
    valuesFirst: Array<RequiredUniqueId>,
    valuesSecond: Array<RequiredUniqueId>
): PossibleStatementFormat {
    return `
    INSERT INTO ${tableName} (${columnNameFirst}, ${columnNameSecond})
        VALUES ${getAllValues(valuesFirst, valuesSecond)}
        ON CONFLICT (${columnNameFirst}, ${columnNameSecond}) DO NOTHING;
    `;
}
