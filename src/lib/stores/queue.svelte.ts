import type { QueueItemData } from "$lib/types";

const queues = $state({
	current: null as QueueItemData | null,
	holdQueue: [] as QueueItemData[],
	nextQueue: [] as QueueItemData[],
});

export { queues };

// export let current = $state<QueueItemData | null>(null);

// export let holdQueue = $state<QueueItemData[]>([]);
// export let nextQueue = $state<QueueItemData[]>([]);

// export let queueSize = $derived(holdQueue.length + nextQueue.length + (current ? 1 : 0));
