import { Pool } from "pg";

export interface Initializer {
    initialize(pool: Pool): Promise<Error[] | null>;
}
