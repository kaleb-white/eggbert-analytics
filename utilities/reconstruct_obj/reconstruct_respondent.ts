import { Respondent } from "@/core/entities/users/respondent";

export function reconstructRespondent(
    respondent: string | Respondent
): Respondent {
    const asRespondent =
        typeof respondent === "string"
            ? (JSON.parse(respondent as string) as Respondent)
            : (respondent as Respondent);

    return new Respondent({
        uniqueId: asRespondent.uniqueId,
        email: asRespondent.email,
        lastLogin: asRespondent.lastLogin,
        timeCreated: asRespondent.timeCreated,
    });
}
