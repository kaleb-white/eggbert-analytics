import { User } from "./user";

export class Respondent extends User {
    constructor(uniqueId: string = "") {
        super(uniqueId);
    }
}
