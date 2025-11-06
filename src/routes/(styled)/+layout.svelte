<script lang="ts">
	import type { Snippet } from "svelte";
	import { Toaster } from "$lib/common/toasts";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<Toaster />

{@render children?.()}
