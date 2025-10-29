import { appRouter } from "$lib/server/trpc/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = (event) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req: event.request,
		router: appRouter,
		createContext() {
			// pass anything here that you want to access in your resolvers
			return {
				auth: event.locals.auth,
			};
		},
	});
};

export const POST = GET;
