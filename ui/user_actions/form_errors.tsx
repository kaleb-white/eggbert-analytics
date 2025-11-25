import { UserServerActionResult } from "@/core/gateways/interfaces/external/users_server_actions";

export function FormErrors({result, forName, hide = false}: {result: UserServerActionResult, forName: string, hide?: boolean}) {
    if (hide) return <></>
    if (result.succesful) return <></>

    let errors: Error[]
    const possibleErrors = ["password", "email", "other", "role", "timeCreated", "uniqueId", "lastLogin"]
    if (forName.startsWith("exclude:")) {
        // ie, "email, other"
        const excludedErrorsAsString = forName.substring("exclude".length + 1)
        // ie, ["email", "other"]
        let excludedErrorArray = excludedErrorsAsString.split(", ")
        excludedErrorArray = excludedErrorArray.map(err => err.trim().replace(",", ""))
        // ie, ["password", "role", "timeCreated", "uniqueId", "lastLogin"]
        const errorArray = possibleErrors.filter(possibleError => !excludedErrorArray.includes(possibleError))
        const errorsPossiblyUndefined = errorArray.flatMap(error => {
            if (result[error] && !(typeof result[error] === "boolean") && !(typeof result[error] === "number")) {
                return result[error]
            }
        })
        errors = errorsPossiblyUndefined.filter(e => {if (e) return true; return false}) as Error[]
    } else {
        if (!Object.keys(result).includes(forName)) return <></>
        if (typeof result[forName] === "boolean" || typeof result[forName] === "number") return <></>
        errors = result[forName]
    }

    if (!Array.isArray(errors)) return <></>

    return (
        <div className="ml-3 text-warning font-semibold text-2xs flex flex-col g-1 p-0 m-0">
            {errors.map((error, i) => {
                return (
                    <div key={i}>• {error.message}</div>
                )
            })}
        </div>
    )
}
