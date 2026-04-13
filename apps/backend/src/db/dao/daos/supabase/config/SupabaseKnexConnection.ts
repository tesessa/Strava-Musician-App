import knex from "knex";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

function findEnvFile(startDir: string): string | null {
  let currentDir = startDir;

  while (true) {
    const candidate = path.join(currentDir, ".env");
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

const envFilePath = findEnvFile(process.cwd());
if (envFilePath) {
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

const isTest = process.env.NODE_ENV === "test";

const connectionString = isTest
  ? process.env.SUPABASE_CONNECTION_TEST
  : process.env.SUPABASE_CONNECTION;

console.log(
  "Using connection string:",
  connectionString ? connectionString.substring(0, 35) + "..." : "None",
);
if (!connectionString) {
  throw new Error("SUPABASE_CONNECTION environment variable is not set");
}

// Knex 3 ESM typings omit the callable signature on default import; runtime is correct.
// @ts-expect-error — knex default is the factory at runtime (see knex/types/index.d.mts)
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
