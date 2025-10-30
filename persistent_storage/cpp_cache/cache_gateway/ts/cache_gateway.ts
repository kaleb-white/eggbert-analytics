export interface CacheGateway {
    connect(): Promise<null | Error>;
    create(id: string, value: string, isLast?: boolean): Promise<null | Error>;
    read(id: string, isLast?: boolean): Promise<string | Error>;
    update(id: string, value: string, isLast?: boolean): Promise<null | Error>;
    delete(id: string, isLast?: boolean): Promise<null | Error>;
}
