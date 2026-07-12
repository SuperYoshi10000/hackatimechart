<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import { onMount } from "svelte";

    import { SVGTimeRenderer } from "$lib/time-render";
    import type { AllHeartbeats, HeartbeatSpan, UserStats } from "$lib/types";
    import { getHMSFromTime } from "$lib/util";

    let p = $props();
    let {
        allHeartbeats,
        data,
        trust_factor
    }: UserStats & { allHeartbeats: AllHeartbeats } = p.data;

    let chartLabels: HTMLDivElement;
    let chartSvg: SVGSVGElement;

    const {searchParams} = page.url;
    
    const width = 3600; // 1 hour
    const height = 240; // 24 hours
    const barSize = 10;
    const scale = 1/6;
    const barColorOffset = 200;
    const barColor = "hsl(200, 100%, 50%)";
    const fgcolor = "white";
    const bgColor = "#1F1F1F";

    const SECONDS_PER_DAY = 86400;
    const HOURS_PER_DAY = 24;
    const minutesPerThickLine = 5;
    const hoursPerThickLine = 6;

    const use12HourTime = true;

    const {name: p_name, user} = page.params;
    
    let totalTime = data?.total_seconds ?? 0;
    const [totalHours, totalMinutes] = getHMSFromTime(totalTime);
    const [averageHours, averageMinutes] = getHMSFromTime(data?.daily_average ?? 0);

    const TRUST_FACTORS = {
        "blue": "Blue - Normal",
        "green": "Green - Trusted",
        "red": "Red - Banned"
    }
    const trustFactorText = TRUST_FACTORS[trust_factor.trust_level];

    const DEFAULT_SHOW_DAYS = 7;

    let dayOffset = -DEFAULT_SHOW_DAYS + 1;
    let date = new Date(Date.now() + dayOffset * SECONDS_PER_DAY * 1000);
    let showDays = $state(searchParams.has("days") ? Number(searchParams.get("days")) : DEFAULT_SHOW_DAYS); // how many days to show
    let ts: string | null = $state(null);

    if (searchParams.has("ts")) {
        ts = searchParams.get("ts")!;
        if (ts === "today") {
            date = new Date(Date.now());
            showDays = 1;
        } else if (ts === "yesterday") {
            date = new Date(Date.now() - SECONDS_PER_DAY * 1000);
            showDays = 1;
        } else if (ts === "yesterday-today") {
            date = new Date(Date.now() - SECONDS_PER_DAY * 1000);
            showDays = 2;
        } else if (/-(\d+)d/.test(ts)) {
            date = new Date(Date.now() - Number(ts.match(/-(\d+)d/)?.[1]) * SECONDS_PER_DAY * 1000);
        } else if (ts?.includes('-')) {
            const [year, month, day] = ts.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else date = new Date(Number(ts) * 1000);
        
    }

    date.setHours(0, 0, 0, 0);

    let offset = date.getTime() / 1000; // seconds since unix epoch, at start of day
    
    const SHOW_DAYS_OPTIONS = ['', 1, 2, 3, 4, 5, 6, 7, 14, 30];
    const DATE_OPTIONS: {[key: string]: [string, number?]} = {
        "Today": ["today"],
        "Yesterday": ["yesterday"],
        "Last 2 Days": ["yesterday-today"],
        "Last Week": ["-6d", 7],
        "Last 2 Weeks": ["-13d", 14],
        "Last 30 Days": ["-29d", 30]
    };

    onMount(draw);

    let renderer: SVGTimeRenderer;
    function draw() {
        renderer = new SVGTimeRenderer(chartSvg, chartLabels, {
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
            setFocusedHeartbeat(heartbeat, [`${x - (w < 20 ? 10 - w * 0.5 : 0)}px`, `${y}px`], event.type === "click" || event.type === "focus");
        });

        const mergedHeartbeats: HeartbeatSpan[] = allHeartbeats
            .flatMap(([name, heartbeats], i) => heartbeats
                .filter(hb => hb.end_time >= offset)
                .map(hb => ({ ...hb, project: name, color: `hsl(${(i * 360 / allHeartbeats.length + barColorOffset) % 360} 100 50)` })));
        renderer.drawAll(mergedHeartbeats);
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

    function handleKey(event: KeyboardEvent) {
        event.preventDefault();
        const focused = document.activeElement as SVGElement;
        switch (event.key) {
            case "Escape":
                setFocusedHeartbeat(null, null, true);
                renderer.clearFocus(true);
                break;
            case "ArrowLeft":
                let previousSibling = focused.previousElementSibling;
                if (previousSibling instanceof SVGRectElement && previousSibling.classList.contains("heartbeat")) previousSibling.focus();
                break;
            case "ArrowRight":
                let nextSibling = focused.nextElementSibling;
                if (nextSibling instanceof SVGRectElement && nextSibling.classList.contains("heartbeat")) nextSibling.focus();
                break;
            case "ArrowUp":
                let previous: Element | null = focused;
                while (focused.previousElementSibling) {
                    previous = previous.previousElementSibling;
                    if (!(previous instanceof SVGRectElement && previous.classList.contains("heartbeat"))) {
                        (focused.parentNode?.querySelector("rect.heartbeat") as SVGRectElement)?.focus();
                        break;
                    }
                    if (previous.tabIndex < focused.tabIndex) {
                        previous.focus();
                        break;
                    }
                }
                break;
            case "ArrowDown":
                let next: Element | null = focused;
                while (focused.nextElementSibling) {
                    next = next.nextElementSibling;
                    if (!(next instanceof SVGRectElement && next.classList.contains("heartbeat"))) {
                        (focused.parentNode?.querySelector(":nth-last-child(1 of rect.heartbeat)") as SVGRectElement)?.focus();
                        break;
                    }
                    if (next.tabIndex > focused.tabIndex) {
                        next.focus();
                        break;
                    }
                }
                break;
            case "Home":
                (focused.parentNode?.querySelector("rect.heartbeat") as SVGRectElement)?.focus();
                break;
            case "End":
                (focused.parentNode?.querySelector(":nth-last-child(1 of rect.heartbeat)") as SVGRectElement)?.focus();
                break;
            case "PageUp":
                let prevDay: Element | null = focused;
                while (focused.previousElementSibling) {
                    prevDay = prevDay.previousElementSibling;
                    if (!(prevDay instanceof SVGRectElement && prevDay.classList.contains("heartbeat"))) {
                        (focused.parentNode?.querySelector("rect.heartbeat") as SVGRectElement)?.focus();
                        break;
                    }
                    if (Math.floor(prevDay.tabIndex / HOURS_PER_DAY) < Math.floor(focused.tabIndex / HOURS_PER_DAY)) {
                        prevDay.focus();
                        break;
                    }
                }
                break;
            case "PageDown":
                let nextDay: Element | null = focused;
                while (focused.nextElementSibling) {
                    nextDay = nextDay.nextElementSibling;
                    if (!(nextDay instanceof SVGRectElement && nextDay.classList.contains("heartbeat"))) {
                        (focused.parentNode?.querySelector(":nth-last-child(1 of rect.heartbeat)") as SVGRectElement)?.focus();
                        break;
                    }
                    if (Math.floor(nextDay.tabIndex / HOURS_PER_DAY) > Math.floor(focused.tabIndex / HOURS_PER_DAY)) {
                        nextDay.focus();
                        break;
                    }
                }
                break;
        }
    }
</script>

<div id="chart-wrapper">
    <div id="chart-info" style:width="{width * scale + 400}px">
        <h1>{user}</h1>
        <div>Total time: {totalHours}h {totalMinutes}m</div>
        <!-- <div>Average: {averageHours}h {averageMinutes}m</div> (This is misleading so I removed it) -->
        <div>Trust factor: {trustFactorText} {#if trust_factor.trust_level === "blue"}<i>(Note: Yellow is replaced with blue in public APIs, so this may be inaccurate)</i>{/if}</div>
        <button onclick={refresh} tabindex="1">Refresh</button>
        <hr>
        <div>
            {#each Object.entries(DATE_OPTIONS) as [text, params], index}
                {index > 0 ? " | " : ""}<a href="?ts={params[0]}{params[1] ? `&days=${params[1]}` : ""}" onclick={event => location.replace((event.target as HTMLAnchorElement).href)} tabindex="1">{text}</a>
            {/each}
        </div>
        <div>
            Show days:
            {#each SHOW_DAYS_OPTIONS as days, index}
                {index > 0 ? " | " : ""}<a href="?{ts !== null ? `ts=${ts}&` : ""}days={days}" onclick={event => location.replace((event.target as HTMLAnchorElement).href)} tabindex="1">{days || `Default (${DEFAULT_SHOW_DAYS})`}</a>
            {/each}
        </div>
    </div>
    <div id="chart-info-spacer"></div>
    <div id="chart-container">
        <div id="chart-labels" bind:this={chartLabels} style:right="calc(50% + {width * scale / 2 + 5}px)"></div>
        <svg id="chart-svg" width={width * scale} height={height * showDays} bind:this={chartSvg}
            onclick={() => setFocusedHeartbeat(null, null, true)}
            onkeydown={handleKey}
            onmousemove={() => setFocusedHeartbeat(null, null)}
        ></svg>
        {#if focusedHeartbeat && focusedHeartbeatPos}
        {@const startDate = new Date(focusedHeartbeat.start_time * 1000)}
        {@const endDate = new Date(focusedHeartbeat.end_time * 1000)}
        {@const [hours, minutes] = getHMSFromTime(focusedHeartbeat.duration)}
        <div id="heartbeat-info" style:translate={focusedHeartbeatPos.join(' ')}>
            <div>
                {focusedHeartbeat.project}<br>
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
    :global(rect.heartbeat:hover, rect.heartbeat:focus) {
        stroke: white;
        stroke-width: 1px;
        z-index: 99999;
        outline: none;
    }

    :global(svg text, svg line) {
        pointer-events: none;
        user-select: none;
    }

    :global(svg use) {
        pointer-events: none;
        user-select: none;
    }
</style>