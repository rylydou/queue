import { checkHashedPassword, grantSession } from "$lib/server/auth";
import { orm } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import type { Actions } from "./$types";

export type FormResponse =
	| {
			status: "ok";
	  }
	| {
			status: "failed";
			message: string;
	  };

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const result = await z
			.object({
				email: z.string().trim().min(1, "An username or email is required"),
				password: z
					.string()
					.min(8, "Password must be at least 8 characters long")
					.max(64, "Password must be 64 or fewer characters long"),
			})
			.safeParseAsync({ ...formData });

		if (!result.success) {
			return fail(400, {
				message: result.error.message,
			});
		}

		const data = result.data;

		const user = await orm.query.user.findFirst({
			where: (u) => or(eq(u.email, data.email)),
		});

		if (!user) {
			return fail(401, {
				message: "No accounts found with that username or email",
			});
		}

		const validPassword = await checkHashedPassword(data.password, user.password);
		if (!validPassword) {
			return fail(401, {
				message: "Invalid password",
			});
		}

		await grantSession(user.id, cookies);

		throw redirect(303, "/");
	},
};
