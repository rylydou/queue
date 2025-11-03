import { fail, redirect } from "@sveltejs/kit";
import z from "zod";
import type { Actions } from "./$types";
import { auth, doc } from "$lib/server";

const schema = z.object({
	secret: z.string("secret").trim().max(100).nonempty("Please enter an access code"),
});

export const actions = {
	submit: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const { data, error } = schema.safeParse(formData);
		if (error) {
			console.warn("[SUBMIT] Invalid form:", error.message, "\n", formData);
			return fail(400, error.issues.map((i) => i.message).join(", "));
		}

		let plaintextPassword = "";
		let hashedPassword = "";
		let isAdminPassword = false;

		if (data.secret.startsWith("admin-")) {
			plaintextPassword = data.secret.replace(/^admin-/, "");
			hashedPassword = doc.config.adminPasswordHash;
			auth.checkHashedPassword(data.secret.replace(/^admin-/, ""), doc.config.adminPasswordHash);
			isAdminPassword = true;
		} else if (data.secret.startsWith("mod-")) {
			plaintextPassword = data.secret.replace(/^mod-/, "");
			hashedPassword = doc.config.modPasswordHash;
			isAdminPassword = false;
		} else {
			return fail(400, "Access code is missing prefix");
		}

		if (!(await auth.checkHashedPassword(plaintextPassword, hashedPassword))) {
			return fail(400, "Invalid access code");
		}

		await auth.grantSession(cookies, isAdminPassword);

		throw redirect(303, "/queue");
	},
} satisfies Actions;
