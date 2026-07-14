<script lang="ts">
    import { page } from "$app/state";
    import PageControl from "$lib/components/PageControl.svelte";
    import type { Leaderboard } from "$lib/types";
    import { getHMSFromTime } from "$lib/util";

    let p = $props();
    let {
        date_range,
        entries,
        generated_at,
        period,
        start_date
    }: Leaderboard = $derived(p.data);

    const range = $derived(period === "daily" ? "Daily" : "Weekly");
    const max = $derived(Number(page.url.searchParams.get("max") || 100));
    const pageNum = $derived(Number(page.url.searchParams.get("page") || 1));
</script>

<svelte:head>
    <title>{range} Leaderboard | Hackatime Chart</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div id="leaderboard-container">
    <h1>{range} Leaderboard</h1>

    <div id="leaderboard-time-toggle">
        <a href="/leaderboard/daily{page.url.search}" data-active={page.params.when === "daily"}>Daily</a>
        <a href="/leaderboard/weekly{page.url.search}" data-active={page.params.when === "weekly"}>Weekly</a>
    </div>

    <PageControl max={max} page={pageNum} />
    <table>
        <colgroup>
            <col style:width="2rem" style:min-width="fit-content"/>
            <col style:width="2rem"/>
            <col/>
            <col style:width="100px"/>
        </colgroup>
        <thead>
            <tr>
                <td class="leaderboard-rank">#</td>
                <td colspan="2">Name</td>
                <td>Time</td>
            </tr>
        </thead>
        <tbody>
            {#each entries as entry}
                {@const [hours, minutes] = getHMSFromTime(entry.total_seconds)}
                <tr>
                    <td class="leaderboard-rank">{entry.rank}</td>
                    <td class="leaderboard-avatar"><img src={entry.user.avatar_url} alt="{entry.user.username} Avatar" loading="lazy"/></td>
                    <td><a href="/project/{entry.user.id}">{entry.user.username}</a></td>
                    <td>{hours}h {minutes}m</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <PageControl max={max} page={pageNum} />
</div>

<style>
    #leaderboard-container {
        display: flex;
        flex-direction: column;
        min-width: 80vw;
        width: 500px;
        max-width: 100vw;
        margin: auto;
    }

    #leaderboard-time-toggle {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        max-width: 200px;
        gap: 0.5rem;
    }
    #leaderboard-time-toggle a {
        width: 50%;
        text-align: center;
        padding: 0.5rem;
        font-weight: bold;
        border-radius: 1rem;
    }
    #leaderboard-time-toggle > a:is(:hover, :focus) {
        background: #FFFFFF1F;
    }
    #leaderboard-time-toggle a[data-active=true] {
        background-color: var(--color-accent);
    }
    tr {
        height: 2rem;
    }
    tbody tr:is(:hover, :focus) {
        background: #FFFFFF1F;
    }

    td {
        padding: 0.2rem;
    }
    .leaderboard-rank {
        text-align: right;
        padding: 0 0.5rem;
    }
    .leaderboard-avatar {
        text-align: center;
        padding: 0;
        max-width: 2rem;
    }
    td img {
        width: 2rem;
    }

    a {
        color: white;
        text-decoration: none;
    }
</style>