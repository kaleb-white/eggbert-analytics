export interface SurveyDatabase {
    saveSurvey(uniqueId: string, survey: string): null | Error;
    loadSurveyWithResponsesFromDb(uniqueId: string): string;
    loadSurveyWithoutResponsesFromDb(uniqueId: string): string;
}
