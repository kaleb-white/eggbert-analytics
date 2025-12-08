import * as tc from "./type_checks";

/**
 * Checks an entity against all type checks.
 * Requires that type check exists for the given entity and that the name of the type check function is in the format `isEntityName(obj: unkown): boolean`.
 * Important: any object that is a subset of another object will be identified as the parent object! For example, 'Respondents' and 'Authors' are both 'Users'.
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
    // Debug
    if (process.env.UTILITIES_DEBUG && process.env.UTILITIES_DEBUG === "1") {
        const missingKeys = Object.keys(obj as object).filter(
            (key) => !Object.keys(objOfTypeT as object).includes(key)
        );
        if (missingKeys.length > 0) {
            console.log(
                "Keys missing from obj found in objOfTypeT:",
                missingKeys.join(", ")
            );
        }
    }
    return isEntity(obj) === isEntity(objOfTypeT);
}
