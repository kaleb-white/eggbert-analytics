import { initializationStatements } from "@/persistent_storage/postgres_db/initialization/sql";
import testPool from "./test_pool";

export async function initialize() {
    for (const statement of Object.keys(initializationStatements)) {
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
