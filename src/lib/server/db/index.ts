import { DB_URL } from "$env/static/private";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

export * as schema from "./schema";

if (!DB_URL) throw new Error("DB_URL is not set");
const dbClient = new Database(DB_URL);

export const orm = drizzle(dbClient, { schema });
