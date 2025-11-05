<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { toast } from "$lib";
	import type { LayoutProps } from "./$types";

	let { data, children }: LayoutProps = $props();
</script>

<svelte:window
	on:keyup={(e) => {
		const formElements = ["INPUT", "TEXTAREA", "SELECT", "OPTION"];
		// @ts-ignore
		if (formElements.includes(e.target?.tagName || "UNKNOWN")) {
			toast("Ignored: " + e.key);
			return;
		}

		const isOnModPage = page.url.pathname === "/mod" || page.url.pathname.startsWith("/mod/");

		if (e.key === "m") {
			if (isOnModPage) {
				toast("Switching to Queue");
				goto("/queue");
			} else {
				toast("Switching to Mod View");
				goto("/mod");
			}
		}
	}}
/>

{@render children()}
