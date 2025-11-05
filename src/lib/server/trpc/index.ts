import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export * from "./context";

const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;

export const publicProcedure = trpc.procedure;

export const modProcedure = trpc.procedure.use(({ ctx, next }) => {
	const isMod = ctx.isMod || false;
	if (!isMod) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next();
});

export const adminProcedure = trpc.procedure.use(({ ctx, next }) => {
	const isAdmin = ctx.isAdmin || false;
	if (!isAdmin) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next();
});
