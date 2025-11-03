import { initTRPC, TRPCError } from "@trpc/server";

const trpc = initTRPC.create();

export const router = trpc.router;

export const publicProcedure = trpc.procedure;

export const modProcedure = trpc.procedure.use((opts) => {
	const isMod = (opts.ctx as any).isMod || false;
	if (!isMod) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return opts.next();
});

export const adminProcedure = trpc.procedure.use((opts) => {
	const isAdmin = (opts.ctx as any).isAdmin || false;
	if (!isAdmin) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return opts.next();
});
