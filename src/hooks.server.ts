import { isAuthed } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	// TODO
	event.locals.isMod = true;

	return await resolve(event);
};
