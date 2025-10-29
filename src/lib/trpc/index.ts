import { browser } from "$app/environment";
import { page } from "$app/state";
import type { AppRouter } from "$lib/server/trpc/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const createTRPC = () => {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				// We use the absolute path on the server
				url: browser ? "/api/trpc" : `${page.url.origin}/api/trpc`,
			}),
		],
	});
};
