<script lang="ts">
	import { page } from "$app/state";
</script>

<main class="grid place-items-center h-screen text-center">
	<div class="flex-col items-center gap-2">
		<h1 class="font-mono text-4xl font-bold">{page.status}</h1>
		<div>{page.error?.message}</div>
	</div>
</main>
