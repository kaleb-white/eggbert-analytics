import type { Model } from "./model";

export class ModelTest implements Model {
    *requestModelAnswerAsync(context: string, userInput: string) {
        yield context;
        yield userInput;
    }
}
