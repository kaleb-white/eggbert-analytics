import type { Model } from "../../interfaces/external/model";

export class LiteLLMModelImpl implements Model {
    *requestModelAnswerAsync(context: string, userInput: string) {
        throw new Error("Method not implemented.");
    }
}
