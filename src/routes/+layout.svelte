<script lang="ts">
	import favicon from '$lib/assets/htcicon.png';
  	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />
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
		margin: 0;
    }

	:global(a) {
        color: #7FBFFF;
        text-decoration: none;
    }
    :global(a:hover) {
        text-decoration: underline;
    }
</style>