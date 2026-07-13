<script lang="ts">
    let user: string = $state("");
    let project: string = $state("");
</script>

<svelte:head>
    <title>Hackatime Chart</title>
</svelte:head>

<div id="container">
    <h1>Hackatime Chart</h1>
    <p>Graphs the time you spent on Hackatime</p>

    <form id="search-form" onsubmit={() => location.href = `/project/${user}/${project}`} >
        <label for="search-user">
            <span>User or Slack ID</span>
            <input id="search-user" bind:value={user}/>
        </label>
        <label for="search-project">
            <span>Project name (optional)</span>
            <input id="search-project" bind:value={project}/>
        </label>
        <button type="submit" disabled={!user}>Go</button>
    </form>
</div>

<style>
    #container {
        align-items: stretch;
        display: flex;
        flex-direction: column;
        width: 300px;
        margin: auto;
    }
    #search-form {
        display: flex;
        flex-direction: column;
    }
    #search-form label {
        display: flex;
        flex-direction: column;
    }
    #search-form input {
        padding: 0.5rem;
        margin: 0.2rem 0 0.5rem;
        border-radius: 0.5rem;
        background: #0000001F;
        color: white;
        border: 1px solid #7F7F7F7F;
    }
    #search-form button {
        padding: 0.5rem;
        margin: 0.2rem 0 0.5rem;
        border-radius: 0.5rem;
        background: hsl(200 100 50);
        color: white;
        border: 1px solid #7F7F7F7F;
        font-weight: bold;
    }
    #search-form button:disabled {
        opacity: 0.5;
    }
    #search-form button:not(:disabled) {
        cursor: pointer;
    }
</style>