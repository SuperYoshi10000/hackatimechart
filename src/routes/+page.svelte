<script lang="ts">
    let user: string = $state("");
    let project: string = $state("");
</script>

<title>Hackatime Chart</title>

<div id="search-form">
    User or Slack ID
    <input bind:value={user}/>
    Project name (optional)
    <input bind:value={project}/>
    <button onclick={() => location.href = `/project/${user}/${project}`}>Go</button>
</div>

<style>
    #search-form {
        align-items: stretch;
        display: flex;
        flex-direction: column;
        width: 300px;
        margin: auto;
    }
    #search-form input {
        padding: 0.2rem;
        margin: 0.2rem 0 0.5rem;
    }
</style>