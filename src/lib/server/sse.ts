import type { Emitter } from "sveltekit-sse";

export const queueListeners = new Set<Emitter>();
export const statusListeners = new Set<Emitter>();
