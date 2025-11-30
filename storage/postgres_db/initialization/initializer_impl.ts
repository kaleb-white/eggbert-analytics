import { db_debug } from "@/utilities/verbose_checks";
import { Initializer } from "../interfaces/initializer";
import { initializationStatements } from "./initializer_sql";
import { Pool } from "pg";
import { truncateStatements } from "./truncation_sql";

export class InitializerImpl implements Initializer {
    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async removeAllRows(): Promise<Error[] | null> {
        const errors: Error[] = [];
        for (const statement of Object.keys(truncateStatements)) {
            if (db_debug()) {
                console.log("Running statement", statement, "on database");
            }
            try {
                await this.pool.query(truncateStatements[statement]);
            } catch (err) {
                console.log("Error in", statement, ":", err);
                errors.push(new Error(JSON.stringify(err)));
            }
        }
        if (errors.length === 0) return null;
        return errors;
    }

    async initialize(): Promise<Error[] | null> {
        const errors: Error[] = [];
        for (const statement of Object.keys(initializationStatements)) {
            if (db_debug()) {
                console.log("Running statement", statement, "on database");
            }
            if (statement.includes("create")) {
                try {
                    await this.pool.query(initializationStatements[statement]);
                } catch (err) {
                    console.log("Error in", statement, ":", err);
                    errors.push(new Error(JSON.stringify(err)));
                }
            } else {
                try {
                    await this.pool.query(initializationStatements[statement]);
                } catch {}
            }
        }
        if (errors.length == 0) return null;
        return errors;
    }
}
