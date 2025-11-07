import type { Model } from "../../interfaces/external/model";

export class LiteLLMModelImpl implements Model {
    async *requestModelAnswerAsync(context: string, userInput: string) {
        throw new Error("Method not implemented.");
    }
}
