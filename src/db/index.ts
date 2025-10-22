import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, {
    schema,
});

type Database = typeof db;

export { db, type Database };
