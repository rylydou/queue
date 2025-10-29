import { statusListeners, queueListeners } from "$lib/server/sse";
import { error } from "@sveltejs/kit";
import { produce, type Emitter } from "sveltekit-sse";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ url, getClientAddress }) => {
	return produce(async ({ emit }) => {
		const address = getClientAddress();
		console.log("[SSE] New listener:", address);

		let listeners: Set<Emitter> | undefined;

		switch (url.searchParams.get("channel")) {
			default:
			case "queue":
				listeners = queueListeners;
				break;
			case "status":
				listeners = statusListeners;
				break;
		}

		if (!listeners) {
			return error(400, "Invalid channel");
		}

		listeners.add(emit);

		emit("meta", "If your reading this, then you should be getting live updates from the server :)");

		return () => {
			// Cleanup
			console.log("[SSE] Listener disconnected:", address);
			listeners.delete(emit);
		};
	});
};
