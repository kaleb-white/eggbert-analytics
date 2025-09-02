import { SurveyDatabase } from "@/core/gateways/surveys/interfaces/survey_database";

export class DatabaseStub implements SurveyDatabase {
    saveSurvey(uniqueId: string, survey: string): null | Error {
        return null;
    }
    loadSurveyWithResponsesFromDb(uniqueId: string): string {
        return JSON.stringify(new Error("Tried to load survey from db stub"));
    }
    loadSurveyWithoutResponsesFromDb(uniqueId: string): string {
        return JSON.stringify(new Error("Tried to load survey from db stub"));
    }
}
