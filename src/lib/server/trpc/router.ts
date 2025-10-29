import { z } from "zod";
import { publicProcedure, router } from "./index";

export const appRouter = router({
	hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
		return { greeting: `hello ${input.text}` };
	}),
});

export type AppRouter = typeof appRouter;
