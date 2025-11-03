import { appRouter } from "$lib/server/trpc/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = (event) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req: event.request,
		router: appRouter,
		createContext() {
			return {
				isMod: event.locals.isMod,
				isAdmin: event.locals.isAdmin,
			};
		},
	});
};

export const POST = GET;
