import type { QueueItemData, QueueItemID } from "$lib/types";
import { file } from "bun";
import path from "path";
import z from "zod";
import { serverConfig } from ".";
import { queueListeners, statusListeners } from "./sse";

// export let current: QueueItemData | null = null;
// export let holdQueue: QueueItemData[] = [];
// export let nextQueue: QueueItemData[] = [];
// export let submissionCount = 0;

export const configSchema = z.object({
	setupDone: z.boolean().default(false),
	adminPasswordHash: z.string().default(""),
	modPasswordHash: z.string().default(""),
	acceptingSubmissions: z.boolean().default(false),
	maxSubmissions: z.int().default(100),
	maxQueueSize: z.int().default(50),
});
export const config = configSchema.parse({} as const);

export const queueSchema = z.object({
	submissionCount: z.int().default(0),
	current: z.any().nullable().default(null),
	holdQueue: z.array(z.any()).default([]),
	nextQueue: z.array(z.any()).default([]),
});
export const queue = queueSchema.parse({} as const);
export let itemMap = new Map<QueueItemID, QueueItemData>();

const configFilePath = path.join(serverConfig.dataPath, "config.json");
const queueFilePath = path.join(serverConfig.dataPath, "queue.json");

let isDoingExitSave = false;

export const saveData = async () => {
	console.log("Saving data...");

	const configFile = file(configFilePath);
	const queueFile = file(queueFilePath);

	configFile.write(JSON.stringify(config));
	queueFile.write(JSON.stringify(JSON.stringify(configSchema)));
};

export const attemptExitSave = () => {
	if (isDoingExitSave) return;
	isDoingExitSave = true;
	saveData();
};

export const loadData = async () => {
	const configFile = file(configFilePath);
	const queueFile = file(queueFilePath);

	if (await configFile.exists()) {
		console.log("Found existing config");
		const { data: configData } = configSchema.safeParse(await configFile.json());
		Object.assign(config, configData || {});

		if (await queueFile.exists()) {
			console.log("Found existing queue");
			const { data: queueData } = queueSchema.safeParse(await queueFile.json());
			Object.assign(queue, queueData || {});

			itemMap.clear();
			for (const item of [queue.current, ...queue.holdQueue, ...queue.nextQueue]) {
				if (item) {
					itemMap.set(item.id, item);
				}
			}
		}
	} else {
		console.log("No existing data found.");
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
			if (queue.current) {
				deleteItem(queue.current.id);
			}
			queue.current = data;

			for (const emit of statusListeners.values()) {
				emit("current", JSON.stringify(queue.current));
			}
			break;
		case "hold":
			{
				let index = queue.holdQueue.findIndex((i) => i.id === data.afterID);
				if (index < 0) {
					index = 0;
				}
				queue.holdQueue.splice(index + 1, 0, data);
			}
			break;
		case "queue":
			{
				let index = queue.nextQueue.findIndex((i) => i.id === data.afterID);
				if (index < 0) {
					index = 0;
				}
				queue.nextQueue.splice(index + 1, 0, data);
			}
			break;
	}

	for (const emit of queueListeners.values()) {
		emit("create", JSON.stringify(data));
	}

	saveData();
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
				queue.current = null;
				break;
			case "hold":
				{
					let index = queue.holdQueue.findIndex((i) => i.id === patch.id);
					if (index < 0) return;
					queue.holdQueue.splice(index, 1);
				}
				break;
			case "queue":
				{
					let index = queue.nextQueue.findIndex((i) => i.id === patch.id);
					if (index < 0) return;
					queue.nextQueue.splice(index, 1);
				}
				break;
		}

		// Then add the item to the new section
		switch (patch.status) {
			case "current":
				// Delete previous current if that exists
				if (queue.current) {
					deleteItem(queue.current.id);
				}
				queue.current = item;

				for (const emit of statusListeners.values()) {
					emit("current", JSON.stringify(queue.current));
				}
				break;
			case "hold":
				{
					let index = queue.holdQueue.findIndex((i) => i.id === patch.afterID);
					if (index < 0) {
						index = 0;
					}
					queue.holdQueue.splice(index + 1, 0, item);
				}
				break;
			case "queue":
				{
					let index = queue.nextQueue.findIndex((i) => i.id === patch.afterID);
					if (index < 0) {
						index = 0;
					}
					queue.nextQueue.splice(index + 1, 0, item);
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
						let index = queue.holdQueue.findIndex((i) => i.id === patch.afterID);
						if (index < 0) {
							index = 0;
						}
						queue.holdQueue.splice(index + 1, 0, item);
					}
					break;
				case "queue":
					{
						let index = queue.nextQueue.findIndex((i) => i.id === patch.afterID);
						if (index < 0) {
							index = 0;
						}
						queue.nextQueue.splice(index + 1, 0, item);
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
			queue.current = null;

			for (const emit of statusListeners.values()) {
				emit("current", "null");
			}
			break;
		case "hold":
			queue.holdQueue.splice(
				queue.holdQueue.findIndex((i) => i.id === id),
				1,
			);
			break;
		case "queue":
			queue.nextQueue.splice(
				queue.nextQueue.findIndex((i) => i.id === id),
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

process.on("exit", () => attemptExitSave());
process.on("SIGTERM", () => attemptExitSave());
process.on("SIGINT", () => attemptExitSave());
