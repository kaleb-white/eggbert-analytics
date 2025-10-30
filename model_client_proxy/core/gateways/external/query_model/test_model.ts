import { sleep } from "bun";
import type { Model } from "../../interfaces/external/model";

export class ModelTest implements Model {
    *requestModelAnswerAsync(context: string, userInput: string) {
        yield context;
        yield userInput;
    }
}
