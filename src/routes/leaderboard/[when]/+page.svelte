<script lang="ts">
  import type { Leaderboard } from "$lib/types";
  import { getHMSFromTime } from "$lib/util";

    let p = $props();
    let {
        date_range,
        entries,
        generated_at,
        period,
        start_date
    }: Leaderboard = p.data;

    const range = period === "daily" ? "Daily" : "Weekly";
</script>

<svelte:head>
    <title>{range} Leaderboard | Hackatime Chart</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div>
    <h1>{range} Leaderboard</h1>
    <table>
        <colgroup>
            <col style:width="2rem" style:min-width="fit-content">
            <col style:width="2rem">
            <col>
            <col style:width="100px">
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
                    <td class="leaderboard-avatar"><img src={entry.user.avatar_url} alt="{entry.user.username} Avatar" loading="lazy"></td>
                    <td><a href="/project/{entry.user.id}">{entry.user.username}</a></td>
                    <td>{hours}h {minutes}m</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        min-width: 80vw;
        width: 500px;
        max-width: 100vw;
        margin: auto;
    }

    tr {
        height: 2rem;
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