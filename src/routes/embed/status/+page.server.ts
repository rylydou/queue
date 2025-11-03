import { doc } from "$lib/server";
import type { PageServerLoad } from "./$types";

export const load = (async ({}) => {
	return {
		current: doc.queue.current,
		acceptingSubmissions: true,
	};
}) satisfies PageServerLoad;
