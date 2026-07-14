<script lang="ts">
    let {
        max = 100,
        page = 1
    }: {
        max?: number;
        page?: number;
    } = $props();
</script>

<div>
    <a href="?max={max}&page={Math.max(1, page - 1)}">Previous Page</a> |
    <a href="?max={max}&page={page + 1}">Next Page</a> |
    <a href="?max={max}&page=1">First Page</a> |
    <a href="?max=50&page={page}">50</a> |
    <a href="?max=100&page={page}">100</a> |
    <a href="?max=200&page={page}">200</a> |
    <a href="?max=500&page={page}">500</a> |
    <a href="?max=Infinity&page={page}">All</a>
</div>

<style>
    div {
        margin: 20px 0;
    }
</style>