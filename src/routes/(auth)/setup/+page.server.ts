import { digits, lowerAlpha, newUserID } from "$lib/server";
import { hashPassword, grantSession } from "$lib/server/auth";
import { orm, schema } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Actions } from "./$types";

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const result = await z
			.object({
				email: z.email("Invalid email address").trim().min(1, "An email is required"),
				//username: z
				//	.string()
				//	.toLowerCase()
				//	.trim()
				//	.min(1, "A username is required")
				//	.max(20, "Username must be 20 or fewer characters long"),
				password: z
					.string()
					.min(8, "Password must be at least 8 characters long")
					.max(64, "Password must be 64 or fewer characters long"),
				confirmPassword: z.string(),
			})
			.safeParseAsync({ ...formData });

		if (!result.success) {
			return fail(400, {
				message: result.error.issues[0].message,
			});
		}

		const data = result.data;

		//const validUsernameCharacters = lowerAlpha + digits + "._-";

		//if (!data.username.split("").every((ch) => validUsernameCharacters.includes(ch))) {
		//	return fail(400, {
		//		message: "Username may only contain lowercase letters, numbers, periods, dashes, and underscores",
		//	});
		//}

		//if (
		//	await orm.query.user.findFirst({
		//		where: (u) => eq(u.username, data.username),
		//		columns: { id: true },
		//	})
		//) {
		//	return fail(400, {
		//		message: "That username is already taken",
		//	});
		//}

		if (
			await orm.query.user.findFirst({
				where: (u) => eq(u.email, data.email),
				columns: { id: true },
			})
		) {
			return fail(400, {
				message: "That email is already used on another account",
			});
		}

		if (data.password !== data.confirmPassword) {
			return fail(400, {
				message: "Passwords don't match",
			});
		}

		const hashedPassword = await hashPassword(data.password);

		// create new user
		const newUser = (
			await orm
				.insert(schema.user)
				.values({
					id: newUserID(),
					email: data.email,
					//username: data.username,
					password: hashedPassword,
				})
				.returning()
		).at(0);

		if (!newUser) {
			return fail(500, {
				message: "Failed to signup - Try again later",
			});
		}

		await grantSession(newUser.id, cookies);

		throw redirect(303, "/");
	},
};
