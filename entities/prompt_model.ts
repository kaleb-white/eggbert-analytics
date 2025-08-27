import { Turn } from "./surveys/turn";

export interface ModelPrompterInterface {
    askModel(prompt: string, context: string): string
}
