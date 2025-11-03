import { getAndRefreshAuth } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const auth = await getAndRefreshAuth(event.cookies);

	if (auth) {
		event.locals.isAdmin = auth.isAdmin;
		event.locals.isMod = true;
	} else {
		event.locals.isAdmin = false;
		event.locals.isMod = false;
	}

	return await resolve(event);
};
