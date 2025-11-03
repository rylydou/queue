import { bool, str, table, timestamp } from "./shared";

export const sessionTokenLength = 64;

export const session = table("session", {
	token: str("token", { length: sessionTokenLength }).primaryKey(),
	isAdmin: bool("is-admin").notNull().default(false),
	createdAt: timestamp("created_at")
		.notNull()
		.$default(() => new Date()),
	activeAt: timestamp("active_at")
		.notNull()
		.$default(() => new Date()),
});
