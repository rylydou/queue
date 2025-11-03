import { doc } from "$lib/server";
import { orm, schema } from "$lib/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from ".";

export const appRouter = router({
	hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
		return { greeting: `hello ${input.text}` };
	}),

	deleteAllSessions: adminProcedure.query(async () => {
		const res = await orm.delete(schema.session).returning();
		return { deletedCount: res.length };
	}),

	setupServer: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
		if (doc.config.setupDone) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
	}),
});

export type AppRouter = typeof appRouter;
