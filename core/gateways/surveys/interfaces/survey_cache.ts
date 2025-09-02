export interface SurveyCache {
    saveSurvey(uniqueId: string, survey: string): null | Error;
    saveSurveyAsynchronously(uniqueId: string, survey: string): null | Error;
    loadSurveyWithResponsesFromCache(uniqueId: string): string;
    loadSurveyWithoutResponsesFromCache(uniqueId: string): string;
}
