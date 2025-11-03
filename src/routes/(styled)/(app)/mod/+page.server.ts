import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	if (!locals.isMod) {
		throw redirect(303, "/mod/auth");
	}

	return {
		isAdmin: locals.isAdmin,
	};
}) satisfies PageServerLoad;
