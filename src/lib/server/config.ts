import * as env from "$env/static/private";
import type { StringValue } from "ms";
import z from "zod";
import { newIdGenerator } from "./nanoid";

export const passwordSaltRounds = Number(env.SESSION_TOKEN_SECRET) || 10;

const newSecret = newIdGenerator(
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+[]{};':\",.<>/?\\`~",
	32,
);

export const sessionTokenSecret = newSecret(32);
export const sessionTokenTimeToLive = (env.SESSION_TOKEN_LIFE_TIME || "1h") as StringValue;
export const sessionTokenSaltRounds = Number(env.SESSION_TOKEN_SALT_ROUNDS) || 6;

export const dataPath = env.DATA_PATH || "./data";
export const autoMigrate = z.coerce.boolean().default(true).parse(env.DB_MIGRATE);
export const dbURL = env.DB_URL || "data/local.db";
