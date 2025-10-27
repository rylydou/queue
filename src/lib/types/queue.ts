export type QueueItemData = {
	id: string;
	submittedAt: Date;

	status: QueueItemStatus;
	statusChangedAt: Date;

	url: string;
	title: string;
	by: string;
	note: string;
	infoChangedAt: Date;
};

export type QueueItemStatus = "queue" | "hold" | "current";
