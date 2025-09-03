import { SurveyDatabase } from "@/core/gateways/surveys/interfaces/survey_database";

export class DatabaseStub implements SurveyDatabase {
    async saveSurvey(uniqueId: string, survey: string): Promise<null | Error> {
        return null;
    }
    async loadSurveyWithResponsesFromDb(uniqueId: string): Promise<string> {
        return JSON.stringify(new Error("Tried to load survey from db stub"));
    }
    async loadSurveyWithoutResponsesFromDb(uniqueId: string): Promise<string> {
        return JSON.stringify(new Error("Tried to load survey from db stub"));
    }
}
