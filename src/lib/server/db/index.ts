import { env } from "$env/dynamic/private";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export * as schema from "./schema";

if (!env.DB_URL) throw new Error("DB_URL is not set");
const dbClient = new Database(env.DB_URL);

export const orm = drizzle(dbClient, { schema });
