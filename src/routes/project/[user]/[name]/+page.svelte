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
    const barColor = "blue";
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

    onMount(drawSvg);

    function drawSvg() {
        drawRect(0, 0, width * scale, height * showDays, bgColor);

        heartbeats.forEach(heartbeat => {
            const start = heartbeat.start_time;
            // const end = heartbeat.end_time;
            const duration = heartbeat.duration;

            let next: { x1: number; x2: number; y: number } | null = {
                x1: start % width,
                x2: (start % width) + duration,
                y: Math.floor((start - offset) / width) * barSize
            }

            let c = 0;
            while (next) {
                let { x1, x2, y }: { x1: number; x2: number; y: number } = next;
                if (x2 >= width) { // overflow
                    next = {
                        x1: 0,
                        x2: x2 - width,
                        y: y + barSize
                    }
                    x2 = width;
                } else next = null;
                
                drawRect(x1 * scale, y, (x2 - x1) * scale, barSize, barColor);

                c++
                if (c > 99) {
                    console.error("Too many iterations, breaking out of loop");
                    break;
                }
            }
        })
        for (let m = 0; m <= 60; m++) {
            let color = `rgba(255, 255, 255, ${m % minutesPerThickLine === 0 ? 0.25 : 0.125})`;
            let x = m * 60 * scale;
            drawLine(x, 0, x, height * showDays, color);
        }
        for (let d = 0; d < showDays; d++) {
            let dayStart = d * secondsPerDay + offset;
            let time = heartbeats.filter(h => h.start_time >= dayStart && h.start_time < dayStart + secondsPerDay).reduce((a, b) => a + b.duration, 0);
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time % 3600) / 60);
            let thisDay = new Date(dayStart * 1000);

            const dayY = d * 240;
            drawLine(0, dayY, width * scale, dayY, "white", 2);
            
            
            addDateLabel(thisDay, dayY);
            addLabel(`Total: ${hours}h ${minutes}m`, dayY + 20);
            drawText(1, dayY, use12HourTime ? "12a" : "0", "#7F7F7F", barSize * 0.75);

            for (let h = 1; h < 24; h++) { // 1 to not overlap day line
                let y = d * 240 + h * barSize;
                drawLine(0, y, width * scale, y, "#FFFFFF7F", h % hoursPerThickLine === 0 ? 2 : 1);
                drawText(1, y, use12HourTime ? (h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`) : `${h}`, "#7F7F7F", barSize * 0.75);
            }

            if (dayStart > Date.now() / 1000) {
                // can't see the future
                drawRect(0, d * 240, width * scale, 240, "#0000007F");
                addLabel("In the future", dayY + 40);
            }
            if (dayStart === new Date().setHours(0, 0, 0, 0) / 1000) {
                addLabel("Today", dayY + 40);
            }
        }
        drawLine(0, showDays * 240, width * scale, showDays * 240, "white", 2);

    }

    function drawLine(x1: number, y1: number, x2: number, y2: number, color: string = "white", width: string|number = 1): SVGLineElement {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.x1.baseVal.value = x1;
        line.y1.baseVal.value = y1;
        line.x2.baseVal.value = x2;
        line.y2.baseVal.value = y2;
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", String(width));
        chartSvg.append(line);
        return line;
    }
    function drawRect(x: number, y: number, w: number, h: number, color: string = "white"): SVGRectElement {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.x.baseVal.value = x;
        rect.y.baseVal.value = y;
        rect.width.baseVal.value = w;
        rect.height.baseVal.value = h;
        rect.setAttribute("fill", color);
        chartSvg.append(rect);
        return rect;
    }
    function drawText(x: number, y: number, content: string, color: string = "white", size: string|number = 12): SVGTextElement {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", String(x));
        text.setAttribute("y", String(y + Number(size))); // y is baseline
        text.setAttribute("fill", color);
        text.setAttribute("font-size", String(size));
        text.textContent = content;
        chartSvg.append(text);
        return text;
    }
    function addDateLabel(date: Date, pos: number) {
        const dateStr = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        return addLabel(dateStr, pos);
    }
    function addLabel(text: string, pos: number) {
        let label = document.createElement("div");
        label.textContent = text;
        label.classList.add("chart-label");
        label.style.top = `${pos}px`;
        chartLabels.append(label);
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