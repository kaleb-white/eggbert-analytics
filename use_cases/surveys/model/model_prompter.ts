import { ModelPrompterInterface } from "@/entities/prompt_model";

export class ModelPrompterImpl implements ModelPrompterInterface{
    askModel(prompt: string, context: string): string {
        return "ModelPrompterImpl method askModel called"
    }

}
