import { Turn } from "./turn";

export class Transcript {
    turns: Turn[]

    constructor(turns: Turn[]) {
        this.turns = turns
    }
}
