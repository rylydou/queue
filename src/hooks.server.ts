import { isAuthed } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const auth = await isAuthed(event.cookies);

	if (auth) {
		event.locals.auth = {
			id: auth,
		};
	}

	return await resolve(event);
};
