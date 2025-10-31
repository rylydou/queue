export type QueueItemData = {
	id: QueueItemID;
	submittedAt: Date | string;
	afterID?: QueueItemID;

	status: QueueItemStatus;
	statusChangedAt: Date | string;

	url: string;
	title: string;
	by: string;
	note: string;
	infoChangedAt: Date | string;
};

export type QueueItemStatus = "queue" | "hold" | "current" | "done";

export type QueueItemID = string;
