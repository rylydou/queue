import { doc } from "$lib/server";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async () => {
	if (!doc.config.setupDone) {
		throw redirect(303, "/setup");
	}
	return {};
}) satisfies LayoutServerLoad;
