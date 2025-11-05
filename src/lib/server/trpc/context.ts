import type { RequestEvent } from "@sveltejs/kit";

export const createContext = (event: RequestEvent) => () => ({
	...event,
	refreshToken: event.locals.refreshToken,
	sessionToken: event.locals.sessionToken,
	isMod: event.locals.isMod,
	isAdmin: event.locals.isAdmin,
});

export type Context = Awaited<ReturnType<typeof createContext>>;
