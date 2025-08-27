import { Turn } from "./turn";

export class Transcript {
    private firstTurn: Turn
    private turns: Turn[]
    /** Indexed at 0 */
    private currentTurn: number

    constructor(firstTurn: Turn, turns?: Turn[]) {
        this.firstTurn = firstTurn

        this.turns = turns? turns : []

        this.currentTurn = this.numOfTurnsTaken
    }

    get getFirstTurn() {
        return this.firstTurn
    }

    /**
     * Returns the turns in the transcript object.
     * @returns All the turns in the transcript, which are ordered by default
     */
    get getTurns() {
        return this.turns
    }

    get dialogueAsString() {
        return [this.firstTurn.modelOutputAndUserAnswerAsString]
            .concat(this.getTurns.map(
                turn => turn.modelOutputAndUserAnswerAsString
            ))
            .join("")
            .replace(/^\n/, "")
    }

    get numOfTurnsTaken() {
        let res = 0
        if (this.firstTurn.turnWasTaken) res++
        res += this.turns.filter(turn => turn.turnWasTaken).length
        return res
    }

    set setFirstTurn(newFirstTurn: Turn) {
        this.firstTurn = newFirstTurn
    }

    set setTurns(newTurns: Turn[]) {
        this.turns = newTurns
    }

    addTurn(newTurn: Turn) {
        this.turns = this.turns.concat(newTurn)
    }


}
