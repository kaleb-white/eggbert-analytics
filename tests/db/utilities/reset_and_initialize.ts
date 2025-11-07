import { initializationStatements } from "@/storage/postgres_db/initialization/sql";
import { db_debug } from "@/utilities/verbose_checks";
import testPool from "./test_pool";

export async function initialize() {
    for (const statement of Object.keys(initializationStatements)) {
        if (db_debug()) {
            console.log("Running statement", statement, "on test database");
        }
        if (statement.includes("create")) {
            try {
                await testPool.query(initializationStatements[statement]);
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                await testPool.query(initializationStatements[statement]);
            } catch (e) {}
        }
    }
}
