import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

if (!process.env.DB_URL) {
	throw new Error("DB_URL is not defined!");
}

export default defineConfig({
	schema: "./src/lib/server/db/schema",
	dialect: "sqlite",
	dbCredentials: { url: process.env.DB_URL },
	verbose: true,
	strict: true,
});
