export interface SurveyDatabase {
    saveSurvey(uniqueId: string, survey: string): Promise<null | Error>;
    loadSurveyWithResponsesFromDb(uniqueId: string): Promise<string>;
    loadSurveyWithoutResponsesFromDb(uniqueId: string): Promise<string>;
}
