import { relations } from "drizzle-orm";
import { ref, str, table, timestamp } from "./shared";
import { user } from "./user";

export const sessionTokenLength = 64;

export const session = table("session", {
	token: str("token", { length: sessionTokenLength }).primaryKey(),
	userID: ref("user_id")
		.notNull()
		.references(() => user.id),
	createdAt: timestamp("created_at")
		.notNull()
		.$default(() => new Date()),
	activeAt: timestamp("active_at")
		.notNull()
		.$default(() => new Date()),
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userID],
		references: [user.id],
		relationName: "user",
	}),
}));
