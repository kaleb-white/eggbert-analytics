import { HandlerParamsNotStreaming, Role } from "litellm/dist/src/types";
import { ModelGateway } from "../use_cases/surveys/interfaces/model_gateway";
import Anthropic from "@anthropic-ai/sdk";

export class LiteLlmAnthropicGateway implements ModelGateway {
    async test() {
        const client = new Anthropic({
            apiKey: process.env.LITE_LLM_API_KEY,
            baseURL: "https://litellmproxy.osu-ai.org/anthropic",
        });
        const message = await client.messages.create({
            max_tokens: 1024,
            messages: [{ role: "user", content: "Hello, Claude" }],
            model: "claude-3.7",
        });
        console.log(message);
    }

    streamResponse(
        prompt: string,
        context: string
    ): AsyncGenerator<string> | Error {
        throw new Error("Method not implemented.");
    }
    generateResponse(prompt: string, context: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
}

const test = new LiteLlmAnthropicGateway();
test.test();
