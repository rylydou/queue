import { auth, doc } from "$lib/server";
import { orm, schema } from "$lib/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, modProcedure, publicProcedure, router } from ".";

export const appRouter = router({
	hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
		return { greeting: `hello ${input.text}` };
	}),

	deleteMySession: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.refreshToken) return;
		await auth.deleteSessionUsingCookie(ctx.cookies);
	}),

	deleteAllSessions: adminProcedure.query(async ({}) => {
		const res = await orm.delete(schema.session).returning();
		return { deletedCount: res.length };
	}),

	setupServer: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
		if (doc.config.setupDone) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
	}),

	updateItem: modProcedure
		.input(
			z.object({
				id: z.string(),
				submittedAt: z.coerce.date(),
				afterID: z.string().optional(),
				status: z.enum(["queue", "hold", "current", "done"]).optional(),
				statusChangedAt: z.coerce.date(),
				url: z.string().optional(),
				title: z.string().optional(),
				by: z.string().optional(),
				note: z.string().optional(),
				infoChangedAt: z.coerce.date(),
			}),
		)
		.query(({ input }) => {
			if (input.status) {
				input.statusChangedAt = new Date();
			}

			if (input.title || input.url || input.by || input.note) {
				input.infoChangedAt = new Date();
			}
			doc.patchItem(input);
		}),

	deleteItem: modProcedure.input(z.string()).query(({ input }) => {
		doc.deleteItem(input);
	}),
});

export type AppRouter = typeof appRouter;
