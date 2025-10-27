import { eq } from "drizzle-orm";
import { orm } from "./db";
import { sessionTokenLength } from "./db/schema";
import { idGenerator } from "./nanoid";

export * as serverConfig from "./config";
export * from "./nanoid";

export const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
export const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const digits = "0123456789";

export const alphaID = idGenerator(lowerAlpha, 6);
export const alphanumID = idGenerator(lowerAlpha + digits, 4);
export const alphanumcaseID = idGenerator(lowerAlpha + upperAlpha + digits, 16);

export const newUserID = idGenerator(lowerAlpha + upperAlpha + digits, 12);
export const newSessionToken = idGenerator(lowerAlpha + upperAlpha + digits, sessionTokenLength);

// 400 days
export const maxCookieAge = 60 * 60 * 24 * 400;

export const getUserTags = async (userID: string) => {
	const user = await orm.query.user.findFirst({
		where: (table) => eq(table.id, userID),
		columns: {
			tags: true,
		},
	});
	if (!user) return [];
	return user.tags.split(" ");
};
