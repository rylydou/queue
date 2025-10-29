import type { QueueItemID, QueueItemData } from "$lib/types";

export const doc = $state({
	current: null as QueueItemData | null,
	holdQueue: [] as QueueItemData[],
	nextQueue: [] as QueueItemData[],
});

// export let current = $state<QueueItemData | null>(null);
// export let holdQueue = $state<QueueItemData[]>([]);
// export let nextQueue = $state<QueueItemData[]>([]);

export const itemMap = new Map<QueueItemID, QueueItemData>();

export const catchupQueue = [];

export const receivePacket = (eventName: string, text: string) => {
	const data = JSON.parse(text);
	switch (eventName) {
		case "add":
			createItem(data);
			break;
		case "patch":
			patchItem(data);
			break;
		case "delete":
			deleteItem(data.id);
			break;
	}
};

export const createItem = (data: QueueItemData) => {
	// If the item already exists then do a patch instead
	if (itemMap.has(data.id)) {
		console.log("[DOC] Tried to add item by item already exists. Doing a patch instead.");
		patchItem(data);
		return;
	}

	console.log(`[DOC] Adding item ${data.id}.`);

	itemMap.set(data.id, data);

	switch (data.status) {
		case "current":
			if (doc.current) {
				deleteItem(doc.current.id);
			}
			doc.current = data;
			break;
		case "hold":
			{
				let index = doc.holdQueue.findIndex((i) => i.id === data.afterID);
				if (index < 0) {
					index = 0;
				}
				doc.holdQueue.splice(index + 1, 0, data);
			}
			break;
		case "queue":
			{
				let index = doc.nextQueue.findIndex((i) => i.id === data.afterID);
				if (index < 0) {
					index = 0;
				}
				console.log("adding queue item at", index);
				doc.nextQueue.splice(index + 1, 0, data);
			}
			break;
	}
};

export const patchItem = (patch: Partial<QueueItemData> & Pick<QueueItemData, "id">) => {
	let item = itemMap.get(patch.id);
	if (!item) {
		console.error(`[DOC] Patch failed. Item with id ${patch.id} not found.`);
		console.log("===", itemMap);
		return;
	}

	const prevStatus = item.status;
	const prevAfterID = item.afterID;

	item = Object.assign(item, patch) as QueueItemData;

	if (patch.status) {
		// Move this item to a different section

		// First, remove the item from the previous section
		switch (prevStatus) {
			case "current":
				doc.current = null;
				break;
			case "hold":
				{
					let index = doc.holdQueue.findIndex((i) => i.id === patch.id);
					doc.holdQueue.splice(index, 1);
				}
				break;
			case "queue":
				{
					let index = doc.nextQueue.findIndex((i) => i.id === patch.id);
					doc.nextQueue.splice(index, 1);
				}
				break;
		}

		// Then add the item to the new section
		switch (patch.status) {
			case "current":
				// Delete previous current if that exists
				if (doc.current) {
					deleteItem(doc.current.id);
				}

				doc.current = item;
				break;
			case "hold":
				{
					let index = doc.holdQueue.findIndex((i) => i.id === patch.afterID);
					if (index < 0) {
						index = -1;
					}
					doc.holdQueue.splice(index + 1, 0, item);
				}
				break;
			case "queue":
				{
					let index = doc.nextQueue.findIndex((i) => i.id === patch.afterID);
					if (index < 0) {
						index = -1;
					}
					doc.nextQueue.splice(index + 1, 0, item);
				}
				break;
		}
	} else {
		if (patch.afterID) {
			// Order in section changed
			switch (item.status) {
				case "current":
					console.error(
						`[DOC] Failed to change order of item ${item.id}. Item is current and therefor does not have an order.`,
					);
					break;
				case "hold":
					{
						const index = doc.holdQueue.findIndex((i) => i.id === patch.afterID);
						if (index < 0) {
							console.error(
								`[DOC] Failed to change order of item ${patch.id}. Parent not found. Probably out of order.`,
							);
						}
						doc.holdQueue.splice(index + 1, 0, item);
					}
					break;
				case "queue":
					{
						const index = doc.nextQueue.findIndex((i) => i.id === patch.afterID);
						if (index < 0) {
							console.error(
								`[DOC] Failed to change order of item ${patch.id}. Parent not found. Probably out of order.`,
							);
						}
						doc.nextQueue.splice(index + 1, 0, item);
					}
					break;
			}
		}
	}
};

export const deleteItem = (id: QueueItemID) => {
	let item = itemMap.get(id);
	if (!item) {
		// console.error(`[DOC] Delete failed. Item with id ${id} not found.`);
		return;
	}

	switch (item.status) {
		case "current":
			doc.current = null;
			break;
		case "hold":
			doc.holdQueue.splice(
				doc.holdQueue.findIndex((i) => i.id === id),
				1,
			);
			break;
		case "queue":
			doc.nextQueue.splice(
				doc.nextQueue.findIndex((i) => i.id === id),
				1,
			);
			break;
	}

	itemMap.delete(id);
};
