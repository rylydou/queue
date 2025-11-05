// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string;
		}
		interface Locals {
			// auth?: Auth;
			refreshToken?: string;
			sessionToken?: string;
			isAdmin: boolean;
			isMod: boolean;
		}
		interface PageData {}
		interface PageState {}
		interface Platform {}
	}
}

export {};
