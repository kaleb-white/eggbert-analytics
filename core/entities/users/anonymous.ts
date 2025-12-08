import { User } from "./user";
import { UserNoRole } from "./user_roles";

export class Anonymous extends User {
    constructor(partialProps?: UserNoRole) {
        super({ ...partialProps, role: "anonymous" });
    }
}
