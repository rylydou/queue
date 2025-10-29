import z from "zod";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { createItem, nextQueue } from "$lib/server/doc";
import { newUrlID } from "$lib/server";

const schema = z.object({
	url: z
		.url({ protocol: /^https?$/, hostname: z.regexes.domain, error: "Invalid link", abort: true })
		.max(500, "URL is too long")
		.nonempty("Missing link"),
	title: z
		.string("Invalid title")
		.trim()
		.max(40, "Title is too long")
		.regex(/^[ -~]*$/, "Invalid characters in title")
		.nonempty("Missing title"),
	by: z
		.string("Invalid username")
		.trim()
		.max(100, "Username is too long")
		.regex(/^[ -~]*$/, "Invalid characters in username")
		.nonempty("Missing username"),
	note: z.string("Invalid note").trim().max(500, "Note is too long").prefault(""),
});

export const actions = {
	submit: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const { data, error } = schema.safeParse(formData);
		if (error) {
			console.warn("[SUBMIT] Invalid form:", error.message, "\n", formData);
			return fail(400, error.issues.map((i) => i.message).join(", "));
		}
		console.log("[SUBMIT] A viewer submitted a game");
		createItem({
			id: newUrlID(),
			status: "queue",
			afterID: nextQueue.at(-1)?.id,
			submittedAt: new Date(),
			infoChangedAt: new Date(),
			statusChangedAt: new Date(),
			...data,
		});
	},
} satisfies Actions;
