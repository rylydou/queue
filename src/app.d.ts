import { type Auth, type AuthUser } from "$lib/types";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string;
		}
		interface Locals {
			auth?: Auth;
		}
		interface PageData {}
		interface PageState {}
		interface Platform {}
	}
}

export {};
