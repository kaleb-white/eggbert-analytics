export interface SurveyDatabase {
    loadSurveyWithResponsesFromDb(uniqueId: string): string;
    loadSurveyWithoutResponsesFromDb(uniqueId: string): string;
}
