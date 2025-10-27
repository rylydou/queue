import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";

export * as schema from "./schema";

if (!env.DB_URL) throw new Error("DB_URL is not set");
const dbClient = new Database(env.DB_URL);

export const orm = drizzle(dbClient, { schema });
