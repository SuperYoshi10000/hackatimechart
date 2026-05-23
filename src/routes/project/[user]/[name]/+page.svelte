<script lang="ts">
  import { onMount } from "svelte";

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
    } = $props();
    
    const width = 3600; // 1 hour
    const height = 240; // 24 hours
    const barSize = 10;
    const color = "green";

    const secondsPerDay = 86400000;

    onMount(() => {
        const canvas = document.getElementById("chart") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            console.error("ctx is undefined");
            return;
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
        heartbeats.forEach(heartbeat => {
            const start = new Date(heartbeat.start_time).getTime() % secondsPerDay;
            const end = new Date(heartbeat.end_time).getTime() % secondsPerDay;

            let next: { x1: number; x2: number; y: number } | null = {
                x1: start % width,
                x2: end % width,
                y: Math.floor(start / width) * barSize + barSize / 2
            }
            while (next) {
                let { x1, x2, y }: { x1: number; x2: number; y: number } = next;
                if (x2 >= width) { // overflow
                    x2 = width;
                    next = {
                        x1: 0,
                        x2: end - width,
                        y: y + barSize
                    }
                } else next = null;
                
                ctx.moveTo(x1, y);
                ctx.beginPath();
                ctx.lineTo(x2, y);
                ctx.stroke();
            }
        })
    });
</script>

<canvas id="chart" width={width} height={height} style="width: 600px; height: 240px;"></canvas>
