import type { QueueItemData } from "$lib/types";

export const doc = $state({
	current: null as QueueItemData | null,
	holdQueue: [] as QueueItemData[],
	nextQueue: [] as QueueItemData[],
});

// export let current = $state<QueueItemData | null>(null);

// export let holdQueue = $state<QueueItemData[]>([]);
// export let nextQueue = $state<QueueItemData[]>([]);

// export let queueSize = $derived(holdQueue.length + nextQueue.length + (current ? 1 : 0));
