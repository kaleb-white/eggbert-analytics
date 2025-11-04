import * as tc from "./type_checks";

/**
 * Checks an entity against all type checks.
 * Requires that type check exists for the given entity and that the name of the type check function is in the format `isEntityName(obj: unkown): boolean`.
 * @param obj the object that might be an entity
 * @returns either the lowercase name of the entity or 'none'
 */
export function isEntity(obj: unknown): string {
    let result = "none";
    Object.keys(tc).forEach((typeCheck) => {
        if (tc[typeCheck](obj)) {
            result = typeCheck.replace("is", "").toLowerCase();
        }
    });
    return result;
}

export function isT<T>(obj: unknown, objOfTypeT: T): boolean {
    return isEntity(obj) === isEntity(objOfTypeT);
}
