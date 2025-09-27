import { CryptographyUtilities } from "../interfaces/crypto_utility_creator";
import { Question } from "./question";
import { SurveyResponse } from "./survey_response";
import { assignOrCreateUniqueId } from "@/stable_utilities/assign_or_create_uid";

export class Survey {
    questions: Question[];
    surveyResponses: SurveyResponse[];
    createdAt: number;
    lastEdited: number;
    uniqueid: string;

    constructor(
        questions: Question[],
        uniqueId: string | CryptographyUtilities,
        surveyResponses: SurveyResponse[],
        createdAt: number = Date.now(),
        lastEdited: number = Date.now()
    ) {
        this.questions = questions;
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

    addQuestion(newQuestion: Question, changeTimeLastEdited = true) {
        this.questions = this.questions.concat(newQuestion);
        if (changeTimeLastEdited) this.lastEdited = Date.now();
    }

    combine(withThisSurvey: Survey): Error | null {
        if (
            !(this.questions.length == withThisSurvey.questions.length) ||
            !this.questions.every((q) => withThisSurvey.questions.includes(q))
        ) {
            return new Error("Question arrays did not match");
        }

        this.surveyResponses = this.surveyResponses.concat(
            withThisSurvey.surveyResponses
        );
        this.lastEdited = Date.now();

        return null;
    }
}
