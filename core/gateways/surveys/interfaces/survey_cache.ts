export interface SurveyCache {
    loadSurveyWithResponsesFromCache(uniqueId: string): string;
    loadSurveyWithoutResponsesFromCache(uniqueId: string): string;
}
