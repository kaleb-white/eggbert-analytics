import { Transcript } from "./transcript"

export class Response {
    summary: string
    transcript: Transcript

    constructor(summary: string, transcript: Transcript) {
        this.summary = summary
        this.transcript = transcript
    }
}
