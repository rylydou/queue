export type Toast = {
	id: number;
	text: string;
	description?: string;
	actions: ToastAction[];
};

export type ToastAction = {
	label: string;
	onClick: () => void;
};

export const toasts = $state<Toast[]>([]);

let letNextToastID = 0;

export const toast = (
	text: string,
	{
		description,
		actions,
		time,
	}: {
		description?: string;
		actions?: ToastAction | ToastAction[];
		time?: number;
	} = {},
) => {
	time ||= 5000;

	if (actions && !Array.isArray(actions)) {
		actions = [actions];
	}

	const toast = {
		id: letNextToastID++,
		text,
		description,
		actions: actions || [],
	};

	toasts.unshift(toast);

	if (time > 0) {
		setTimeout(() => {
			const toastIndex = toasts.findIndex((t) => t.id === toast.id);
			toasts.splice(toastIndex, 1);
		}, time);
	}
};
