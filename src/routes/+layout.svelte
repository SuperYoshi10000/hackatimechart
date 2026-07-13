<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:root {
		font-family: "Roboto", sans-serif;
		font-size: 16px;

		--color-accent: hsl(200 100 50);
	}

	:global(body) {
        background: #1F1F1F;
        color: white;
    }

	:global(a) {
        color: #7FBFFF;
        text-decoration: none;
    }
    :global(a:hover) {
        text-decoration: underline;
    }
</style>