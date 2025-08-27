import { ModelPrompterInterface } from "./entities/prompt_model";
import { ModelPrompterImpl } from "./use_cases/surveys/model/model_prompter";

// Dependency injection happens by choosing which class ModelPrompter extends!
export class ModelPrompter extends ModelPrompterImpl implements ModelPrompterInterface {}
