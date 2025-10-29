import { sseListeners } from "$lib/server/doc";
import { produce } from "sveltekit-sse";
import type { RequestHandler } from "./$types";

function wait(ms: number) {
	return new Promise(function run(resolve) {
		setTimeout(resolve, ms);
	});
}

export const POST: RequestHandler = async ({ getClientAddress }) => {
	return produce(async ({ emit }) => {
		const address = getClientAddress();
		console.log("[SSE] New listener:", address);
		sseListeners.add(emit);

		emit("meta", "If your reading this, then you should be getting live updates from the server :)");

		return () => {
			// Cleanup
			console.log("[SSE] Listener disconnected:", address);
			sseListeners.delete(emit);
		};
	});
};
