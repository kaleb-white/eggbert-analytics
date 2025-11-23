/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Database {
    save(obj: any): Promise<null | Error>;
    get<T>(
        id: string,
        objOfTypeT: T,
        field?: string,
        all?: boolean
    ): Promise<T | T[] | null | Error>;
}
