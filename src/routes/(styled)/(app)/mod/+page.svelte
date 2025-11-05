<script lang="ts">
	import { goto } from "$app/navigation";
	import { toast } from "$lib";
	import { createTRPC } from "$lib/trpc";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const { isAdmin } = data;

	const trpc = createTRPC();
</script>

<div class="layout">
	<h1 class="mt-12 mb-4 text-2xl font-bold">
		Hello {isAdmin ? "admin" : "mod"} 👋
	</h1>

	<div class="layout flex-row gap-4">
		<button
			class="text-btn text-red-600"
			onclick={async () => {
				toast(`Logging you out...`);
				await trpc.deleteMySession.query();
				goto("/");
			}}
		>
			Logout
		</button>
		{#if isAdmin}
			<button
				class="text-btn text-red-600"
				onclick={async () => {
					const { deletedCount } = await trpc.deleteAllSessions.query();
					toast(`Deleted all ${deletedCount} sessions`);
				}}
			>
				Log out all sessions
			</button>
		{/if}
	</div>
</div>
