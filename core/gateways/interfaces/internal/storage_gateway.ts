/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StorageGateway {
    save(id: string, obj: any, noCache?: boolean): Promise<null | Error>;
    get<T>(
        id: string,
        objOfTypeT: T,
        field?: string
    ): Promise<T | null | Error>;
}
