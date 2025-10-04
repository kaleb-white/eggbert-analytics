import { SurveyCache } from "@/core/gateways/surveys/interfaces/survey_cache";
import { createClient } from "redis";

export class RedisBasedSurveyCacheImpl implements SurveyCache {
    private url: string;
    private client;
    private connected = false;

    /**
     * Creates a redis client
     *
     * @param username The user's username
     * @param password The user's password
     * @param port The port redis is running on, 6379 by default
     * @param host The host redis is running on, localhost by default
     */
    constructor(
        username: string,
        password: string,
        port: string = "6379",
        host: string = "localhost"
    ) {
        this.url = `redis://${username}:${password}@${host}:${port}`;
        this.client = createClient({
            url: this.url,
        });
    }

    async testConnection(): Promise<null | Error> {
        await this.connectIfNotConnected();
        if (this.client.isReady) return null;
        else return new Error("Client is not ready");
    }

    async saveSurvey(uniqueId: string, survey: string): Promise<null | Error> {
        await this.connectIfNotConnected();

        await this.client.set(uniqueId, survey);
        const didSurveyPersist = await this.client.get(uniqueId);

        if (didSurveyPersist) return null;
        else return new Error("Failed to save survey!");
    }

    saveSurveyAsynchronously(uniqueId: string, survey: string): null {
        this.client.set(uniqueId, survey);
        return null;
    }

    async loadSurveyFromCache(uniqueId: string): Promise<string> {
        await this.connectIfNotConnected();

        const potentiallyASurvey = await this.client.get(uniqueId);
        return potentiallyASurvey
            ? potentiallyASurvey
            : JSON.stringify(
                  new Error(
                      "No survey with a matching id was found in the cache"
                  )
              );
    }

    private async connectIfNotConnected() {
        if (!this.connected) {
            await this.client.connect();
            this.connected = true;
        }
    }
}
