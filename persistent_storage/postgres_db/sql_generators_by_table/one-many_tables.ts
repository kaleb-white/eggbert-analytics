import { PossibleStatementFormat } from "../generation_types_and_utilities";

export type RequiredUniqueId = {
    uniqueId: string;
};

type OneManyMap = {
    one: string;
    many: string;
};

/**
 * Constructs an array of type OneManyMap from an object, which is the 'one', and an object member denoted by fieldName, which is the 'many'.
 * If the object field doesn't exist or isn't of type RequiredUniqueId[], throws an error.
 * @param obj The object to construct from
 * @param fieldName T
 */
function oneManyMapsFromObjAndField(obj: RequiredUniqueId, fieldName: string) {
    if (!Object.keys(obj).includes(fieldName) || !Array.isArray(obj[fieldName]))
        throw new Error(
            `While mapping an object to a One-Many relation, a field name was provided which did not exist. The field name provided was: ${fieldName}, and the object provided was: ${JSON.stringify(
                obj
            )}`
        );

    const many = obj[fieldName] as RequiredUniqueId[];
    if (many.length == 0) return null;

    if (!Object.keys(many[0]).includes("uniqueId"))
        throw new Error(
            `While mapping an object to a One-Many relation, the field at obj[fieldname] did not have a uniqueId property! The first item in the field provided was: ${JSON.stringify(
                many[0]
            )}`
        );

    return many.map((oneId) => {
        return { one: obj.uniqueId, many: oneId.uniqueId };
    });
}

/**
 * Returns a string of VALUES with the "one" uniqueId first.
 * For example, for a OneManyMap that looks like {one: "abc", many: "def"}, will output (abc, def).
 * @param maps
 */
function getAllValues(maps: OneManyMap[]) {
    return maps.map((oneMany) => `(${oneMany.one}, ${oneMany.many})`).join(",");
}

function objAndFieldToValues(obj: RequiredUniqueId, fieldName: string) {
    const maps = oneManyMapsFromObjAndField(obj, fieldName);
    if (maps == null) return null;
    return getAllValues(maps);
}

export function insertOrUpdateOneManyRelation(
    oneUniqueIdColumnName: string,
    manyUniqueIdColumnName: string,
    tableName: string,
    oneObj: RequiredUniqueId,
    fieldName: string
): PossibleStatementFormat {
    const values = objAndFieldToValues(oneObj, fieldName);
    if (values == null) return "pass";
    return `
    INSERT INTO ${tableName} (${oneUniqueIdColumnName}, ${manyUniqueIdColumnName})
        VALUES ${values}
        ON CONFLICT (${oneUniqueIdColumnName}, ${manyUniqueIdColumnName}) DO NOTHING;
    `;
}
