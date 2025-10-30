import { Pool } from "pg";

const testPool = new Pool({ database: process.env.PGTESTDATABASE });

export default testPool;
