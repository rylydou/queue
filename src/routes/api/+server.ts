import { sseListeners } from "$lib/server/queue";
import { type RequestHandler } from "@sveltejs/kit";
import { produce } from "sveltekit-sse";
// import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({}) => {
	return new Response(null, { status: 200 });
};

export function POST({ getClientAddress }) {
	return produce(async ({ emit }) => {
		const address = getClientAddress();
		console.log("[SSE] New listener:", address);
		sseListeners.add(emit);

		return () => {
			// Cleanup
			console.log("[SSE] Listener disconnected:", address);
			sseListeners.delete(emit);
		};
	});
}
