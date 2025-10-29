import { relations } from "drizzle-orm";
import { ref, str, table, timestamp } from "./shared";

export const sessionTokenLength = 64;

export const session = table("session", {});
