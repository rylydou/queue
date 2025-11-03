import { relations } from "drizzle-orm";
import { id, int, ref, str, table, timestamp } from "./shared";

export const modInvite = table("mod-invite", {
	id: id(),
	uses: int("uses"),
	maxUses: int("max-uses"),
});
