/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Database {
    save(obj: any): Promise<null | Error>;
    get<T>(id: string, objOfTypeT: T): Promise<T | null | Error>;
}
