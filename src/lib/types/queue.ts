export type QueueItemData = {
	id: ItemID;
	submittedAt: Date;

	status: QueueItemStatus;
	statusChangedAt: Date;

	url: string;
	title: string;
	by: string;
	note: string;
	infoChangedAt: Date;
};

export type QueueItemStatus = "queue" | "hold" | "current" | "done";

export type ItemID = string;
