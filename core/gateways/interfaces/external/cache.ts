export interface Cache {
    save(uniqueId: string, obj: object): Promise<null | Error>;
    get<T>(uniqueId: string): Promise<T | Error>;
}
