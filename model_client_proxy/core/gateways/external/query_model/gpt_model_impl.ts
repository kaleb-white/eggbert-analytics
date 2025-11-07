import { response } from "express";
import type { Model } from "../../interfaces/external/model";
import { OpenAI } from "openai";

export class GPTModelImpl implements Model {
    model?: OpenAI;

    // Reference: https://platform.openai.com/docs/guides/streaming-responses?api-mode=responses&lang=javascript
    async *requestModelAnswerAsync(context: string, userInput: string) {
        if (!this.model) {
            this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }

        const stream = await this.model.responses.create({
            model: "gpt-4.1",
            input: [
                {
                    role: "system",
                    content: context,
                },
                {
                    role: "user",
                    content: userInput,
                },
            ],
            stream: true,
        });

        for await (const event of stream) {
            if (event.type == "response.output_text.delta") {
                yield event.delta;
            }
        }
    }
}
