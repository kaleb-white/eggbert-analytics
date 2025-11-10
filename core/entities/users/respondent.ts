import { User } from "./user";
import { UserNoRole } from "./user_roles";

export class Respondent extends User {
    constructor(partialProps?: UserNoRole) {
        super({ ...partialProps, role: "respondent" });
    }
}
