<script lang="ts">
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

    const params = page.url.searchParams;
    
    const width = 3600; // 1 hour
    const height = 240; // 24 hours
    const barSize = 10;
    const scale = 1/6;
    const barColor = "blue";
    const fgcolor = "white";
    const bgColor = "#1F1F1F";

    const secondsPerDay = 86400;
    const minutesPerLine = 5;

    let date = new Date();
    
    if (params.has("ts")) {
        const ts = params.get("ts");
        if (ts?.includes('-')) {
            const [year, month, day] = ts.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else date = new Date(Number(ts) * 1000);
    }

    date.setHours(0, 0, 0, 0);

    let dayOffset = -2;
    let showDays = params.has("days") ? Number(params.get("days")) : 7; // how many days to show
    let offset = date.getTime() / 1000 + dayOffset * secondsPerDay; // seconds since unix epoch, at start of day
    console.log(offset, "d", date.getTime() / 1000);

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
        for (let m = 1; m < 60; m++) {
            let color = `rgba(255, 255, 255, ${m % minutesPerLine === 0 ? 0.25 : 0.125})`;
            drawRect(m * 60 * scale, 0, 1, height * showDays, color);
        }
        for (let d = 0; d < showDays; d++) {
            const dayY = d * 240 - 1;
            drawRect(0, dayY, width * scale, 2, "white");
            addDateLabel(new Date((d * secondsPerDay + offset) * 1000), dayY);
            for (let h = 1; h < 24; h++) { // 1 to not overlap day line
                drawRect(0, d * 240 + h * barSize, width * scale, 1, "#FFFFFF7F");
            }
        }
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number, color: string = "white", width: string|number = 1) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.x1.baseVal.value = x1;
        line.y1.baseVal.value = y1;
        line.x2.baseVal.value = x2;
        line.y2.baseVal.value = y2;
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", String(width));
        chartSvg.append(line);
    }
    function drawRect(x: number, y: number, w: number, h: number, color: string = "white") {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.x.baseVal.value = x;
        rect.y.baseVal.value = y;
        rect.width.baseVal.value = w;
        rect.height.baseVal.value = h;
        rect.setAttribute("fill", color);
        chartSvg.append(rect);
    }
    function addDateLabel(date: Date, pos: number) {
        return addLabel(date.toLocaleDateString(), pos);
    }
    function addLabel(text: string, pos: number) {
        let label = document.createElement("div");
        label.textContent = text;
        label.classList.add("chart-label");
        label.style.position = "absolute";
        label.style.top = `${pos}px`;
        chartLabels.append(label);
    }
</script>

<div id="chart-container">
    <div id="chart-labels" bind:this={chartLabels}></div>
    <svg id="chart-svg" width={width * scale} height={height * showDays} bind:this={chartSvg}></svg>
</div>

<style>
    :global(body) {
        background: #1F1F1F;
        color: white;
    }
    #chart-container {
        display: flex;
        justify-content: center;
    }
    #chart-labels {
        position: relative;
        width: 0;
        overflow: visible;
    }
    .chart-label {
        color: white;
        
        right: 0;
    }
</style>