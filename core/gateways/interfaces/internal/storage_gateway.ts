/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StorageGateway {
    save(id: string, obj: any, noCache?: boolean): Promise<null | Error>;
    get<T extends object>(
        id: string,
        objOfTypeT: T,
        field?: string,
        noCache?: boolean
    ): Promise<T | null | Error>;
    getAll<T extends object>(
        id: string,
        objOfTypeT: T,
        field?: string
    ): Promise<T[] | Error | null>;
    delete<T extends object>(
        ids: string | string[],
        objOfTypeT: T,
        field?: string
    ): Promise<string[] | null | Error>;
}
