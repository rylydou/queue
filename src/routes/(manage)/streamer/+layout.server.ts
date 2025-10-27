import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { orm, schema } from "$lib/server/db";
import { count, eq } from "drizzle-orm";

export const load = (async ({ locals: { auth } }) => {
	if (!auth) {
		const [{ count: userCount }] = await orm.select({ count: count() }).from(schema.user);
		console.log({ userCount });

		if (userCount <= 0) {
			redirect(303, "/setup");
		} else {
			redirect(303, "/login");
		}
	}
	return {};
}) satisfies LayoutServerLoad;
