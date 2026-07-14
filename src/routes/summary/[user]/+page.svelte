<script lang="ts">
  import { page } from "$app/state";
    import type { UserStats, UserSummary } from "$lib/types";
  import { getHMSFromTime } from "$lib/util";

    let p = $props();
    let {
        projects,
        languages,
        data,
        trust_factor,
        status,
    }: (UserSummary & UserStats & {status: 200}) | (Partial<UserSummary & UserStats> & {status: 400 | 403 | 404}) = $derived(p.data);

    const {user} = page.params;

    let totalTime = $derived(data?.total_seconds ?? 0);

    const [totalHours, totalMinutes] = $derived(getHMSFromTime(totalTime));

    const TRUST_FACTORS = {
        "blue": "🔵 Blue - Normal",
        "green": "🟢 Green - Trusted",
        "yellow": "🟡 Yellow - Suspected",
        "red": "🟥 Red - Banned",
        "": "Unknown"
    } as const;
    const trustFactorText = $derived(TRUST_FACTORS[trust_factor?.trust_level ?? ""] ?? "Unknown");
</script>

<svelte:head>
    <title>{user} Summary{status !== 200 ? " (Not found)" : ""} | Hackatime Chart</title>
</svelte:head>

<div id="summary-container">
    {#if status === 200}
        <div>
            <h1>{user} Summary</h1>
            <div>Total time: {totalHours}h {totalMinutes}m</div>
            <!-- <div>Average: {averageHours}h {averageMinutes}m</div> (This is misleading so I removed it) -->
            <div>Trust factor: {trustFactorText} {#if trust_factor?.trust_level === "blue"}<i>(Note: <span style:font-style="normal">🟡</span> Yellow is replaced with blue in public APIs, so this may be inaccurate)</i>{/if}</div>
            <div style:margin-bottom="1em"><a href="/project/{user}">View detailed project information</a></div>
        </div>
        <div id="summary-headers">
            <h2>Projects</h2>
            <h2>Languages</h2>
        </div>
        <div id="summary-boxes">
            <table>
                <colgroup>
                    <col/>
                    <col style:width="100px"/>
                </colgroup>
                <thead>
                    <tr>
                        <td>Project</td>
                        <td>Time</td>
                    </tr>
                </thead>
                <tbody>
                    {#each projects as project}
                        {@const [hours, minutes] = getHMSFromTime(project.total)}
                        <tr>
                            <td><a href="/project/{user}/{project.key}">{project.key}</a></td>
                            <td>{hours}h {minutes}m</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            <table>
                <colgroup>
                    <col/>
                    <col style:width="100px"/>
                </colgroup>
                <thead>
                    <tr>
                        <td>Language</td>
                        <td>Time</td>
                    </tr>
                </thead>
                <tbody>
                    {#each languages as language}
                        {@const [hours, minutes] = getHMSFromTime(language.total)}
                        <tr>
                            <td>{language.key}</td>
                            <td>{hours}h {minutes}m</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <h1>User {user} not found</h1>
        {#if status === 403}
            <p>This user may exist, but they have disabled public stats lookup.</p>
            <p>If this is you, try enabling public stats lookup in <a href="https://hackatime.hackclub.com/my/settings/privacy#user_privacy" target="_blank">Hackatime settings</a>.</p>
        {:else}
            <p>This user may not exist, or they may have disabled public stats lookup.</p>
        {/if}
    {/if}
</div>

<style>
    #summary-container {
        display: flex;
        flex-direction: column;
        min-width: 60vw;
        width: 600px;
        max-width: 100vw;
        margin: auto;
    }

    #summary-headers, #summary-boxes {
        display: flex;
        flex-direction: row;
        justify-items: stretch;
        align-items: start;
        gap: 1rem;
        width: 100%;
    }
    #summary-headers h2, #summary-boxes table {
        flex: 1 1 0;
        max-width: 50%;
    }
    #summary-headers h2 {
        margin: 1rem 0 0.5rem;
    }

    #summary-boxes table tr {
        height: 1.5rem;
    }
    #summary-boxes table td {
        overflow-wrap: anywhere;
    }
</style>