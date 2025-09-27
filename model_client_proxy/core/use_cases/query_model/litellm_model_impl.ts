import type { Model } from "./model";

export class LiteLLMModelImpl implements Model {
    *requestModelAnswerAsync(context: string, userInput: string) {
        throw new Error("Method not implemented.");
    }
}
