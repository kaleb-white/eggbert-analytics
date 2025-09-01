export interface StreamingOutput {
    startStream(): void | Error
    sendChunk(chunk: string): void | Error
    endStream(): void | Error
    error(error: Error): void
}
