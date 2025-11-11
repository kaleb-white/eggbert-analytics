import { db_debug } from "@/utilities/verbose_checks";
import { Initializer } from "../interfaces/initializer";
import { initializationStatements } from "./sql";
import { Pool } from "pg";

export class InitializerImpl implements Initializer {
    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
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
                } catch (e) {}
            }
        }
        if (errors.length == 0) return null;
        return errors;
    }
}
