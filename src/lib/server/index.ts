import { idGenerator } from "./nanoid";

export * as auth from "./auth";
export * as serverConfig from "./config";
export * as doc from "./doc";
export * from "./nanoid";

export const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
export const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const digits = "0123456789";

export const newAlphaID = idGenerator(lowerAlpha, 8);
export const newAlphanumID = idGenerator(lowerAlpha + digits, 8);
export const newAlphanumcaseID = idGenerator(lowerAlpha + upperAlpha + digits, 8);
export const newBase64 = idGenerator(lowerAlpha + upperAlpha + digits + "_-", 8);
export const newUrlID = idGenerator(lowerAlpha + upperAlpha + digits + "_-~.", 8);

export const newUserID = idGenerator(lowerAlpha + upperAlpha + digits, 12);
export const newSessionToken = idGenerator(lowerAlpha + upperAlpha + digits, 32);

// 400 days
export const maxCookieAge = 60 * 60 * 24 * 400;
