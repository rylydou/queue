import type { QueueItemData, QueueItemID } from "$lib/types";
import { file } from "bun";
import * as config from "./config";
import { queueListeners, statusListeners } from "./sse";
import path from "path";

export let current: QueueItemData | null = null;
export let holdQueue: QueueItemData[] = [];
export let nextQueue: QueueItemData[] = [];

export let acceptingSubmissions = true;

export let itemMap = new Map<QueueItemID, QueueItemData>();

const queueFilePath = path.join(config.dataPath, "queues", "main.json");

export const saveData = async () => {
	console.log("Saving data...");
	const dataFile = file(queueFilePath);
	dataFile.write(
		JSON.stringify({
			current,
			holdQueue,
			nextQueue,
			acceptingSubmissions,
		}),
	);
};

export const loadData = async () => {
	const dataFile = Bun.file(queueFilePath);
	if (!dataFile.exists()) {
		console.log("No existing data found.");
		return;
	}

	console.log("Found existing data!");

	const data = await dataFile.json();
	current = data.current || null;
	holdQueue = data.holdQueue || [];
	nextQueue = data.nextQueue || [];
	acceptingSubmissions = data.acceptingSubmissions || true;

	itemMap.clear();
	for (const item of [current, ...holdQueue, ...nextQueue]) {
		if (item) {
			itemMap.set(item.id, item);
		}
	}
};

// TODO: Archive item
export const createItem = (data: QueueItemData) => {
	// If the item already exists then do a patch instead
	if (itemMap.has(data.id)) {
		console.log("[DOC] Tried to add item by item already exists. Doing a patch instead.");
		patchItem(data);
		return;
	}

	console.log(`[DOC] Patching item ${data.id}.`);

	itemMap.set(data.id, data);
	switch (data.status) {
		case "current":
			if (current) {
				deleteItem(current.id);
			}
			current = data;

			for (const emit of statusListeners.values()) {
				emit("current", JSON.stringify(current));
			}
			break;
		case "hold":
			{
				let index = holdQueue.findIndex((i) => i.id === data.afterID);
				if (index < 0) {
					index = 0;
				}
				holdQueue.splice(index + 1, 0, data);
			}
			break;
		case "queue":
			{
				let index = nextQueue.findIndex((i) => i.id === data.afterID);
				if (index < 0) {
					index = 0;
				}
				nextQueue.splice(index + 1, 0, data);
			}
			break;
	}

	for (const emit of queueListeners.values()) {
		emit("create", JSON.stringify(data));
	}
};

export const patchItem = (patch: Partial<QueueItemData> & Pick<QueueItemData, "id">) => {
	let item = itemMap.get(patch.id);
	if (!item) {
		console.error(`[DOC] Patch failed. Item with id ${patch.id} not found.`);
		return;
	}

	console.log(`[DOC] Patching item ${patch.id}.`);

	const prevStatus = item.status;
	const prevAfterID = item.afterID;

	item = Object.assign(item, patch) as QueueItemData;

	if (patch.status) {
		// Move this item to a different section
		console.log(`[DOC] Moving item ${patch.id} from ${prevStatus} to ${patch.status}.`);
		// First, remove the item from the previous section
		switch (prevStatus) {
			case "current":
				current = null;
				break;
			case "hold":
				{
					let index = holdQueue.findIndex((i) => i.id === patch.id);
					if (index < 0) return;
					holdQueue.splice(index, 1);
				}
				break;
			case "queue":
				{
					let index = nextQueue.findIndex((i) => i.id === patch.id);
					if (index < 0) return;
					nextQueue.splice(index, 1);
				}
				break;
		}

		// Then add the item to the new section
		switch (patch.status) {
			case "current":
				// Delete previous current if that exists
				if (current) {
					deleteItem(current.id);
				}
				current = item;

				for (const emit of statusListeners.values()) {
					emit("current", JSON.stringify(current));
				}
				break;
			case "hold":
				{
					let index = holdQueue.findIndex((i) => i.id === patch.afterID);
					if (index < 0) {
						index = 0;
					}
					holdQueue.splice(index + 1, 0, item);
				}
				break;
			case "queue":
				{
					let index = nextQueue.findIndex((i) => i.id === patch.afterID);
					if (index < 0) {
						index = 0;
					}
					nextQueue.splice(index + 1, 0, item);
				}
				break;
		}
	} else {
		if (patch.afterID) {
			// Order in section changed
			console.log(`[DOC] Reordering item ${patch.id}.`);
			switch (item.status) {
				case "current":
					console.error(
						`[DOC] Failed to change order of item ${item.id}. Item is current and therefor does not have an order.`,
					);
					break;
				case "hold":
					{
						let index = holdQueue.findIndex((i) => i.id === patch.afterID);
						if (index < 0) {
							index = 0;
						}
						holdQueue.splice(index + 1, 0, item);
					}
					break;
				case "queue":
					{
						let index = nextQueue.findIndex((i) => i.id === patch.afterID);
						if (index < 0) {
							index = 0;
						}
						nextQueue.splice(index + 1, 0, item);
					}
					break;
			}
		}
	}

	for (const emit of queueListeners.values()) {
		emit("patch", JSON.stringify(patch));
	}
};

// TODO: Archive item
export const deleteItem = (id: QueueItemID) => {
	let item = itemMap.get(id);
	if (!item) {
		console.error(`[DOC] Delete failed. Item with id ${id} not found.`);
		return;
	}

	console.log(`[DOC] Removing item ${id}.`);

	switch (item.status) {
		case "current":
			current = null;

			for (const emit of statusListeners.values()) {
				emit("current", "null");
			}
			break;
		case "hold":
			holdQueue.splice(
				holdQueue.findIndex((i) => i.id === id),
				1,
			);
			break;
		case "queue":
			nextQueue.splice(
				nextQueue.findIndex((i) => i.id === id),
				1,
			);
			break;
	}

	itemMap.delete(id);

	for (const emit of queueListeners.values()) {
		emit("delete", id);
	}
};

loadData();

process.on("exit", () => saveData());
