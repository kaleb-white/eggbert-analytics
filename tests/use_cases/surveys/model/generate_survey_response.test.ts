import { ModelGateway } from "@/use_cases/surveys/interfaces/model_gateway"
import { StreamingOutput } from "@/use_cases/surveys/interfaces/streaming_output"
import { GenerateSurveyResponse } from "@/use_cases/surveys/model/generate_survey_response"
import { describe, expect, mock, test } from "bun:test"

describe("test generate survey response", () => {
    const model: ModelGateway = {
        generateResponse(prompt: string, context: string): Promise<string> {
            return Promise.resolve('abc')
        },

        streamResponse(prompt: string, context: string): AsyncGenerator<string> | Error {
            async function* generator() {
                yield 'a'
                yield 'b'
            }
            return generator()
        }
    }

    const mockChunkReceiver = mock((c) => c)

    const output: StreamingOutput = {
        startStream: function (): void | Error {
            return
        },
        sendChunk: function (chunk: string): void | Error {
            mockChunkReceiver(chunk)
        },
        endStream: function (): void | Error {
            return
        },
        error: function (error: Error): void {
            return
        }
    }

    const g = new GenerateSurveyResponse(model, output)

    test("test generate survey response passes async generator results through", async () => {
        await g.execute('n/a', 'n/a')
        expect(mockChunkReceiver.mock.calls.length).toBe(2)
        expect(mockChunkReceiver.mock.calls).toEqual([['a'], ['b']])
    })

})
