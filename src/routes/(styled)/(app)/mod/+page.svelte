<script lang="ts">
	import { createTRPC } from "$lib/trpc";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const { isAdmin } = data;

	const trpc = createTRPC();
</script>

Hello {isAdmin ? "admin" : "mod"} 👋

<div>
	{#if isAdmin}
		<button
			onclick={async () => {
				await trpc.deleteAllSessions.query();
			}}
		>
			Log out all sessions
		</button>
	{/if}
</div>
