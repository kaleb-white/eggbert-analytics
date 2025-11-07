import { Pool } from "pg";

const testPool = new Pool({
    database: process.env.PGTESTDATABASE, // Change to PGDATABASE for prod
    host: process.platform == "win32" ? "localhost" : process.env.PGHOST,
});
export default testPool;
