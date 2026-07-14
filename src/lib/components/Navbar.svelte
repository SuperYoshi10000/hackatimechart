<script>
    import favicon from '$lib/assets/htcicon.png';
</script>

<nav>
    <span><a href="/"><img src={favicon} alt="Hackatime Chart icon"/>Hackatime Chart</a></span>
    <a href="/">Home</a>
    <a href="/active">Active Users</a>
    <a href="/leaderboard">Leaderboard</a>
</nav>

<style>
    nav {
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: #0F0F0F7F;
        z-index: 999999;
    }
    nav span a {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 1rem;
        color: white;
        text-decoration: none;
    }
    nav span img {
        height: 1.5rem;
        margin-right: 0.5rem;
    }
    nav > a {
        color: white;
        font-weight: bold;
        text-decoration: none;
        width: 100px;
        padding: 0.5rem;
        text-align: center;
    }
    nav > a:hover {
        background: #FFFFFF1F;
    }
</style>