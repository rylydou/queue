import * as doc from "$lib/server/doc";
import type { PageServerLoad } from "./$types";

export const load = (async ({}) => {
	return {
		current: doc.current,
		holdQueue: doc.holdQueue,
		nextQueue: doc.nextQueue,
	};
}) satisfies PageServerLoad;
