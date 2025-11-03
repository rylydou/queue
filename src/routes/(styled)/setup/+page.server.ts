import { auth, doc } from "$lib/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import z from "zod";
import type { PageServerLoad } from "./$types";

export const load = (async ({}) => {
	if (doc.config.setupDone) {
		throw redirect(303, "/mod");
	}
	return {};
}) satisfies PageServerLoad;

const schema = z.object({
	adminPassword: z
		.string("Invalid admin password")
		.trim()
		.max(64, "Admin password is too long")
		.nonempty("Missing admin password"),
	modPassword: z
		.string("Invalid mod password")
		.trim()
		.max(64, "Mod password is too long")
		.nonempty("Missing mod password"),
});

export const actions = {
	submit: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const { data, error } = schema.safeParse(formData);
		if (error) {
			return fail(400, error.issues.map((i) => i.message).join(", "));
		}
		console.log("[SETUP] Setting up...");
		doc.config.adminPasswordHash = await auth.hashPassword(data.adminPassword);
		doc.config.modPasswordHash = await auth.hashPassword(data.modPassword);
		doc.config.setupDone = true;
		auth.grantSession(cookies, true);
		throw redirect(303, "/queue");
	},
} satisfies Actions;
