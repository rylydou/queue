import { doc } from "$lib/stores/app.svelte";
import type { PageServerLoad } from "./$types";

export const load = (async ({}) => {
	return {
		current: doc.current,
		acceptingSubmissions: true,
	};
}) satisfies PageServerLoad;
