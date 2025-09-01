import { ModelGateway } from "../interfaces/model_gateway";
import { StreamingOutput } from "../interfaces/streaming_output";

export class GenerateSurveyResponse {
    private model: ModelGateway
    private output: StreamingOutput

    constructor(
        modelGateway: ModelGateway,
        outputToStreamTo: StreamingOutput
    ) {
        this.model = modelGateway
        this.output = outputToStreamTo
    }

    async execute(
        prompt: string,
        context: string
    ): Promise<Error | void> {
        // Create output stream
        const tryCreateOutputStream = this.output.startStream()
        if (tryCreateOutputStream instanceof Error) return tryCreateOutputStream

        // Create model stream
        const modelOutputStream = this.model.streamResponse(prompt, context)
        if (modelOutputStream instanceof Error) {
            this.output.error(modelOutputStream)
            return modelOutputStream
        }

        let trySendChunk
        for await (const chunk of modelOutputStream) {
            trySendChunk = this.output.sendChunk(chunk)
            if (trySendChunk instanceof Error) {
                this.output.error(trySendChunk)
                return trySendChunk
            }
        }

        const tryEndOutputStream = this.output.endStream()
        if (tryEndOutputStream instanceof Error) return tryEndOutputStream
    }

}
