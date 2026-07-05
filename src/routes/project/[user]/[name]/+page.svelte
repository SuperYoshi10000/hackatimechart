<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";

    let p = $props();
    let {
        heartbeats,
        name,
        total_seconds,
        languages,
        repo_url,
        total_heartbeats,
        first_heartbeat,
        last_heartbeat
    }: {
        heartbeats: HeartbeatSpan[];
        name: string;
        total_seconds: number;
        languages: string[];
        repo_url: string;
        total_heartbeats: number;
        first_heartbeat: string;
        last_heartbeat: string;
    } = p.data;

    let chartLabels: HTMLDivElement;
    let chartSvg: SVGSVGElement;

    const {searchParams} = page.url;
    
    const width = 3600; // 1 hour
    const height = 240; // 24 hours
    const barSize = 10;
    const scale = 1/6;
    const barColor = "hsl(200, 100%, 50%)";
    const fgcolor = "white";
    const bgColor = "#1F1F1F";

    const secondsPerDay = 86400;
    const minutesPerThickLine = 5;
    const hoursPerThickLine = 6;

    const use12HourTime = true;

    const {user} = page.params;
    
    let totalTime = total_seconds;

    let dayOffset = -6;
    let date = new Date(Date.now() + dayOffset * secondsPerDay * 1000);
    let showDays = $state(searchParams.has("days") ? Number(searchParams.get("days")) : 7); // how many days to show

    if (searchParams.has("ts")) {
        const ts = searchParams.get("ts")!;
        if (ts === "today") {
            date = new Date(Date.now());
            showDays = 1;
        } else if (ts === "yesterday") {
            date = new Date(Date.now() - secondsPerDay * 1000);
            showDays = 1;
        } else if (ts === "yesterday-today") {
            date = new Date(Date.now() - secondsPerDay * 1000);
            showDays = 2;
        } else if (/-(\d+)d/.test(ts)) {
            date = new Date(Date.now() - Number(ts.match(/-(\d+)d/)?.[1]) * secondsPerDay * 1000);
        } else if (ts?.includes('-')) {
            const [year, month, day] = ts.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else date = new Date(Number(ts) * 1000);
        
    }

    date.setHours(0, 0, 0, 0);

    let offset = date.getTime() / 1000; // seconds since unix epoch, at start of day

    onMount(draw);

    function draw() {
        const renderer = new SVGTimeRenderer(chartSvg, chartLabels, {width, height, scale, offset, showDays, bgColor, barColor, barSize, minutesPerThickLine, hoursPerThickLine, use12HourTime})

        renderer.draw(heartbeats);
    }

    function refresh() {
        invalidateAll();
        location.reload();
    }
</script>

<div id="chart-wrapper">
    <div id="chart-info" style:width="{width * scale + 400}px">
        <h1>{name}</h1>
        <div>Creator: {user}</div>
        <div>Total time: {Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m</div>
        <div><a href={repo_url} target="_blank">{repo_url}</a></div>
        <button onclick={refresh}>Refresh</button>
    </div>
    <div id="chart-info-spacer"></div>
    <div id="chart-container">
        <div id="chart-labels" bind:this={chartLabels} style:right="calc(50% + {width * scale / 2 + 5}px)"></div>
        <svg id="chart-svg" width={width * scale} height={height * showDays} bind:this={chartSvg}></svg>
    </div>
</div>

<style>
    :global(body) {
        background: #1F1F1F;
        color: white;
    }

    #chart-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #chart-info {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 2px solid gray;
    }

    #chart-container {
        display: flex;
        justify-content: center;
    }
    #chart-labels {
        position: absolute;
        height: 100%;
        overflow: visible;
        width: 200px;
        white-space: nowrap;

        display: flex;
        flex-direction: column;
        align-items: end;
    }
    :global(.chart-label) {
        color: white;
        position: absolute;
    }

    a {
        color: #7F7FFF;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
</style>