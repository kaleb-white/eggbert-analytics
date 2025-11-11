import { Pool } from "pg";

const testPool = new Pool({
    database: process.env.PGTESTDATABASE, // PGDATABASE is prod
    host: process.platform == "win32" ? "localhost" : process.env.PGHOST, // If in container, host is the bridge network, otherwise its localhost
});
export default testPool;
