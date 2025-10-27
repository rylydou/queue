import { env } from "$env/dynamic/private";
import { config } from "dotenv";
import { idGenerator } from "./nanoid";
import type { StringValue } from "ms";

config();

export const passwordSaltRounds = Number(env.SALT_ROUNDS) || 10;

const jwtSecretGenerator = idGenerator(
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+[]{};':\",.<>/?\\`~",
	32,
);

export const jwtSecret = jwtSecretGenerator();
export const jwtTimeToLive = (env.JWT_TTL || "1h") as StringValue;
export const jwtSaltRounds = Number(env.JWT_SALT_ROUNDS) || 6;
