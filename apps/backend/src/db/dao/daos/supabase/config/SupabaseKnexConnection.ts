import knex from "knex";
import * as dotenv from "dotenv";

dotenv.config();
const isTest = process.env.NODE_ENV === "test";

const connectionString = isTest
  ? process.env.SUPABASE_CONNECTION_TEST
  : process.env.SUPABASE_CONNECTION;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const db = knex({
  client: "pg",
  connection: {
    connectionString, // Supabase connection string
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
