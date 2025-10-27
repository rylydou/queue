import { relations } from "drizzle-orm";
import { session } from "./session";
import { bool, id, str, table, timestamp } from "./shared";

export const user = table("user", {
	id: id(),
	//username: str("username").notNull().unique("user_username"),
	email: str("email").notNull().unique("user_email"),
	password: str("password").notNull(),
	createdAt: timestamp("created_at")
		.notNull()
		.$default(() => new Date()),

	isAdmin: bool("is_admin").default(false).notNull(),
	displayName: str("display_name").default("").notNull(),

	tags: str("tags").default("").notNull(),
});

export const userReleations = relations(user, ({ many }) => ({
	sessions: many(session, { relationName: "sessions" }),
}));
