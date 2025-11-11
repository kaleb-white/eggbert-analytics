import { InitializerImpl } from "@/storage/postgres_db/initialization/initializer_impl";
import { describe, expect, test } from "bun:test";
import { Pool } from "pg";

describe("test test initializer", () => {
    test("should not error", async () => {
        const pool = new Pool({
            database: "test_initializer",
            host:
                process.platform == "win32" ? "localhost" : process.env.PGHOST,
        });
        const i = new InitializerImpl(pool);
        const results = await i.initialize();
        expect(results).toBeNull();
    });
});
