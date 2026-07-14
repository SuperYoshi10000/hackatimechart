<script lang="ts">
    import { page } from "$app/state";
    import { PUBLIC_FLAG_API_CODES_URL, PUBLIC_FLAG_API_URL } from "$env/static/public";
    import PageControl from "$lib/components/PageControl.svelte";
    import type { ActiveUsers } from "$lib/types";
    import { onMount } from "svelte";

    let p = $props();
    let {
        count,
        users
    }: ActiveUsers = $derived(p.data);

    const max = $derived(Number(page.url.searchParams.get("max") || 100));
    const pageNum = $derived(Number(page.url.searchParams.get("page") || 1));

    let countryNames: Record<string, string> = $state({});

    onMount(async () => {
        countryNames = await fetch(PUBLIC_FLAG_API_CODES_URL).then(res => res.json());
    })

    function getFlagUrl(countryCode: string): string {
        return PUBLIC_FLAG_API_URL.replace("%s", countryCode.toLowerCase());
    }
</script>

<svelte:head>
    <title>Active Users | Hackatime Chart</title>
</svelte:head>

<div>
    <h1>Active Users</h1>
    <p>{count} users are currently active</p>
    <PageControl max={max} page={pageNum} />
    <table>
        <colgroup>
            <col style:width="2rem" style:min-width="fit-content"/>
            <col/>
            <col/>
        </colgroup>
        <thead>
            <tr>
                <td colspan="2">Name</td>
                <td>Working on</td>
            </tr>
        </thead>
        <tbody>
            {#each users as user}
                {@const countryName = countryNames[user.country_code.toLowerCase()] || user.country_code}
                <tr>
                    <td class="active-users-avatar"><img src={user.avatar_url} alt="{user.display_name} Avatar" loading="lazy"/></td>
                    <td>{user.display_name}<img class="active-users-flag" src={getFlagUrl(user.country_code)} alt="{countryName} Flag" title={countryName} loading="lazy"/></td>
                    {#if user.working_on}
                        <td><a href={user.working_on.repo_url}>{user.working_on.project_name}</a></td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
    <PageControl max={max} page={pageNum} />
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
        max-height: 2rem;
    }

    td {
        padding: 0.2rem;
    }
    .active-users-avatar {
        text-align: center;
        padding: 0;
    }
    .active-users-avatar img {
        width: 2rem;
        max-width: 2rem;
        height: 2rem;
        max-height: 2rem;
    }
    .active-users-flag {
        width: 1rem;
        margin-left: 0.5rem;
    }

    a {
        color: #7FBFFF;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
</style>