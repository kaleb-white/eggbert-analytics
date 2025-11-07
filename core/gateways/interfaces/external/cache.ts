export interface Cache {
    save(
        uniqueId: string,
        obj: object,
        isLastCacheInteraction?: boolean
    ): Promise<null | Error>;
    get<T>(
        uniqueId: string,
        isLastCacheInteraction?: boolean
    ): Promise<T | Error>;
}
