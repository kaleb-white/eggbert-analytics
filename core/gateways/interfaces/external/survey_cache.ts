export interface SurveyCache {
    saveSurvey(uniqueId: string, survey: string): Promise<null | Error>;
    loadSurveyFromCache(uniqueId: string): Promise<string>;
}
