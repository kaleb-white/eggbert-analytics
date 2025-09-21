export interface CacheGateway {
    connect(): Promise<null | Error>;
    create(id: string, value: string): Promise<null | Error>;
    read(id: string): Promise<string | Error>;
    update(id: string, value: string): Promise<null | Error>;
    delete(id: string): Promise<null | Error>;
}
