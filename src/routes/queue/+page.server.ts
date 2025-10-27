import type { PageServerLoad } from "./$types";
import * as queue from "$lib/server/queue";

export const load = (async () => {
	return {
		current: queue.current,
		holdQueue: queue.holdQueue,
		nextQueue: queue.nextQueue,
	};
}) satisfies PageServerLoad;
