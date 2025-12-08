import { User } from "./user";
import { UserNoRole } from "./user_roles";

export class Author extends User {
    constructor(partialProps?: UserNoRole) {
        super({ ...partialProps, role: "author" });
    }
}
