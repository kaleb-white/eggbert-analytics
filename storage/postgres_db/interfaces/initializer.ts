export interface Initializer {
    initialize(): Promise<Error[] | null>;
    removeAllRows(): Promise<Error[] | null>;
}
