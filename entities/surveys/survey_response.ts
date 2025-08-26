import { Transcript } from "./transcript"

export class surveyResponse {
    summary: string
    transcript: Transcript

    constructor(summary: string, transcript: Transcript) {
        this.summary = summary
        this.transcript = transcript
    }
}
