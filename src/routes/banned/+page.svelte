<script>
    let p = $props();
    let { day, week, month } = $derived(p.data);
</script>

<svelte:head>
    <title>Banned Users | Hackatime Chart</title>
</svelte:head>

<div>
    <h1>Banned Users</h1>
    <p>{day} users were banned in the last day.</p>
    <p>{week} users were banned in the last week.</p>
    <p>{month} users were banned in the last month.</p>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        width: 300px;
        max-width: 100vw;
        margin: auto;
    }
</style>