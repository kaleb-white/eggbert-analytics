export interface SurveyCache {
    testConnection(): Promise<null | Error>;
    saveSurvey(uniqueId: string, survey: string): Promise<null | Error>;
    saveSurveyAsynchronously(uniqueId: string, survey: string): null;
    loadSurveyFromCache(uniqueId: string): Promise<string>;
}
