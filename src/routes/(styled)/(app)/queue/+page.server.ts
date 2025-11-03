import * as doc from "$lib/server/doc";
import type { PageServerLoad } from "./$types";

export const load = (async ({}) => {
	return {
		current: doc.queue.current,
		holdQueue: doc.queue.holdQueue,
		nextQueue: doc.queue.nextQueue,
	};
}) satisfies PageServerLoad;
