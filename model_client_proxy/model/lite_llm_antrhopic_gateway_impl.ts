import type { ModelGateway } from "../core/gateways/model.ts";
import Anthropic from "@anthropic-ai/sdk";

export class LiteLlmAnthropicGateway implements ModelGateway {
    async test() {
        const res = await fetch(
            "https://litellmproxy.osu-ai.org/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${
                        process.env.LITE_LLM_API_KEY as string
                    }`,
                },
                body: JSON.stringify({
                    model: "claude-4.0",
                    prompt: "what model are you?",
                    max_tokens: 1200,
                }),
            }
        );
        console.log(res);
        // const client = new Anthropic({
        //     apiKey: process.env.LITE_LLM_API_KEY,
        //     baseURL: "https://litellmproxy.osu-ai.org/anthropic",
        // });
        // const message = await client.messages.create({
        //     max_tokens: 1024,
        //     messages: [{ role: "user", content: "Hello, Claude" }],
        //     model: "claude-4.0",
        // });
        // console.log(message);
    }
}

const test = new LiteLlmAnthropicGateway();
test.test();
