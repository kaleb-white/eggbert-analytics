import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { ModelDialoguePrompt } from "./model_dialogue_prompt";
import { SurveyResponse } from "./survey_response";
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";

export class Survey {
    modelDialoguePrompts: ModelDialoguePrompt[];
    surveyResponses: SurveyResponse[];
    createdAt: number;
    lastEdited: number;
    uniqueid: string;

    constructor(
        modelDialoguePrompts: ModelDialoguePrompt[],
        uniqueId: string | CryptographyUtilities,
        surveyResponses: SurveyResponse[],
        createdAt: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.modelDialoguePrompts = modelDialoguePrompts;
        this.uniqueid = assignOrCreateUniqueId(uniqueId);
        this.surveyResponses = surveyResponses;
        this.createdAt = createdAt;
        this.lastEdited = lastEdited;
    }

    addResponse(
        newSurveyResponse: SurveyResponse,
        changeTimeLastEdited = true
    ) {
        this.surveyResponses = this.surveyResponses.concat(newSurveyResponse);
        if (changeTimeLastEdited) this.lastEdited = Date.now();
    }

    addPrompt(newPrompt: ModelDialoguePrompt, changeTimeLastEdited = true) {
        this.modelDialoguePrompts = this.modelDialoguePrompts.concat(newPrompt);
        if (changeTimeLastEdited) this.lastEdited = Date.now();
    }
}
