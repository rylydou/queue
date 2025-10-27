export type Auth = {
	id: string;
};

export type AuthUser = {
	username: string;
	displayName: string;
	isAdmin: boolean;
} & Auth;
