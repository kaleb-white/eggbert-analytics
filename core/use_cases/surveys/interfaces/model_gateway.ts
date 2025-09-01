export interface ModelGateway {
    streamResponse(prompt: string, context: string): AsyncGenerator<string> | Error
    generateResponse(prompt: string, context: string): Promise<string>
}
