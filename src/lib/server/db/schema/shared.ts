import { integer, real, sqliteTableCreator, text, index, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

export const table = sqliteTableCreator((name) => name);
export const pk = primaryKey;

export const idx = (name: string) => index(name);
export const uniqueIdx = (name: string) => uniqueIndex(name);

export const int = (name: string) => integer(name, { mode: "number" });
export const bool = (name: string) => integer(name, { mode: "boolean" });
export const float = (name: string) => real(name);

export const timestamp = (name: string) => integer(name, { mode: "timestamp" });
export const str = (
	name: string,
	options?: {
		length?: number;
		enum?: [string, ...string[]];
	},
) =>
	text(name, {
		...options,
		mode: "text",
	});
export const json = (name: string) => text(name, { mode: "json" });

// export const id = (name = 'id') => integer(name).primaryKey({ autoIncrement: true, });
// export const ref = (name: string) => integer(name);
export const id = (name = "id") => text(name).primaryKey();
export const ref = (name: string) => text(name);
