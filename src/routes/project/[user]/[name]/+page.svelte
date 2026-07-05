<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import { onMount } from "svelte";

    import { SVGTimeRenderer } from "$lib/time-render";
    import { getHMSFromTime } from "$lib/util";

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
    const [totalHours, totalMinutes] = getHMSFromTime(totalTime);

    let dayOffset = -6;
    let date = new Date(Date.now() + dayOffset * secondsPerDay * 1000);
    let showDays = $state(searchParams.has("days") ? Number(searchParams.get("days")) : 7); // how many days to show
    let ts: string | null = $state(null);

    if (searchParams.has("ts")) {
        ts = searchParams.get("ts")!;
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
    
    const SHOW_DAYS_OPTIONS = ['', 1, 2, 3, 4, 5, 6, 7, 14, 30];
    const date_urls: {[key: string]: [string, number?]} = {
        "Today": ["today"],
        "Yesterday": ["yesterday"],
        "Last 2 Days": ["yesterday-today"],
        "Last Week": ["-6d", 7],
        "Last 2 Weeks": ["-13d", 14],
        "Last 30 Days": ["-29d", 30]
    };

    onMount(draw);

    function draw() {
        const renderer = new SVGTimeRenderer(chartSvg, chartLabels, {
            width,
            height,
            scale,
            offset,
            showDays,
            bgColor,
            barColor,
            barSize,
            minutesPerThickLine,
            hoursPerThickLine,
            use12HourTime
        }, (event, heartbeat, x, y, w) => {
            event.stopPropagation();
            setFocusedHeartbeat(heartbeat, [`${x - (w < 20 ? 10 - w * 0.5 : 0)}px`, `${y}px`], event.type === "click");
        });

        renderer.drawHeartbeats(heartbeats.filter(hb => hb.end_time >= offset));
    }

    function refresh(event?: Event) {
        invalidateAll();
        location.reload();
    }


    let focusedHeartbeat: HeartbeatSpan | null = $state(null);
    let focusedHeartbeatPos: [string, string] | null = $state(null); // x, y
    let keepFocusedHeartbeat = false;

    function setFocusedHeartbeat(heartbeat: HeartbeatSpan | null, pos: [string, string] | null, keep = false) {
        if (keepFocusedHeartbeat && !keep) return;
        focusedHeartbeat = heartbeat;
        focusedHeartbeatPos = pos;
        keepFocusedHeartbeat = keep && heartbeat !== null;
    }

</script>

<div id="chart-wrapper">
    <div id="chart-info" style:width="{width * scale + 400}px">
        <h1>{name}</h1>
        <div>Creator: {user}</div>
        <div>Total time: {totalHours}h {totalMinutes}m ({total_heartbeats} heartbeats)</div>
        <div>Started: {new Date(first_heartbeat).toLocaleString()} | Last updated: {new Date(last_heartbeat).toLocaleString()}</div>
        <div><a href={repo_url} target="_blank">{repo_url}</a></div>
        <button onclick={refresh}>Refresh</button>
        <hr>
        <div>
            {#each Object.entries(date_urls) as [text, params], index}
                {index > 0 ? " | " : ""}<a href="?ts={params[0]}{params[1] ? `&days=${params[1]}` : ""}" onclick={event => location.replace((event.target as HTMLAnchorElement).href)}>{text}</a>
            {/each}
        </div>
        <div>
            Show days:
            {#each SHOW_DAYS_OPTIONS as days, index}
                {index > 0 ? " | " : ""}<a href="?{ts !== null ? `ts=${ts}&` : ""}days={days}" onclick={event => location.replace((event.target as HTMLAnchorElement).href)}>{days}</a>
            {/each}
        </div>
    </div>
    <div id="chart-info-spacer"></div>
    <div id="chart-container">
        <div id="chart-labels" bind:this={chartLabels} style:right="calc(50% + {width * scale / 2 + 5}px)"></div>
        <svg id="chart-svg" width={width * scale} height={height * showDays} bind:this={chartSvg} onclick={() => setFocusedHeartbeat(null, null, true)} onmousemove={() => setFocusedHeartbeat(null, null)}></svg>
        {#if focusedHeartbeat && focusedHeartbeatPos}
        {@const startDate = new Date(focusedHeartbeat.start_time * 1000)}
        {@const endDate = new Date(focusedHeartbeat.end_time * 1000)}
        {@const [hours, minutes] = getHMSFromTime(focusedHeartbeat.duration)}
        <div id="heartbeat-info" style:translate={focusedHeartbeatPos.join(' ')}>
            <div>
                {focusedHeartbeat.project || name}<br>
                {startDate.toLocaleString()} - {endDate.toLocaleTimeString()} ({hours}h {minutes}m)
            </div>
        </div>
    {/if}
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

    a {
        color: #7F7FFF;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }

    #chart-container {
        position: relative;
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


    #heartbeat-info {
        position: absolute;
        left: 0;
        top: 15px;
        background: gray;
        padding: 5px;
        border-radius: 5px;
    }
    #heartbeat-info::before {
        position: absolute;
        background: url('data:image/svg+xml,<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M5 0 l5 5 l-5 5 l-5 -5 z" fill="gray"/></svg>');
        translate: 0 -9px;
        width: 10px;
        height: 10px;
        content: " ";
    }
    :global(rect.heartbeat:hover) {
        stroke: white;
        stroke-width: 1px;
        z-index: 99999;
    }

    :global(svg text, svg line) {
        pointer-events: none;
        user-select: none;
    }
</style>