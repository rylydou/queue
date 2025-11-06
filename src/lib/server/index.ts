import { newIdGenerator } from "./nanoid";

export * as auth from "./auth";
export * as serverConfig from "./config";
export * as doc from "./doc";
export * from "./nanoid";

export const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
export const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const digits = "0123456789";

export const newAlphaID = newIdGenerator(lowerAlpha, 8);
export const newAlphanumID = newIdGenerator(lowerAlpha + digits, 8);
export const newAlphanumcaseID = newIdGenerator(lowerAlpha + upperAlpha + digits, 8);
export const newBase64 = newIdGenerator(lowerAlpha + upperAlpha + digits + "_-", 8);
export const newUrlID = newIdGenerator(lowerAlpha + upperAlpha + digits + "_-~.", 8);

export const newSecret = newIdGenerator(
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+[]{};':\",.<>/?\\`~",
	32,
);

export const newUserID = newIdGenerator(lowerAlpha + upperAlpha + digits, 12);
export const newSessionToken = newIdGenerator(lowerAlpha + upperAlpha + digits, 32);

// 400 days
export const maxCookieAge = 60 * 60 * 24 * 400;
