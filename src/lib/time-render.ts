const SECONDS_PER_DAY = 86400;

export interface DrawSvgOptions {
  width: number;
  height: number;
  scale: number;
  offset: number;
  showDays: number;
  bgColor: string;
  barColor: string;
  barSize: number;
  minutesPerThickLine: number;
  hoursPerThickLine: number;
  use12HourTime: boolean;
}

export interface TimeRenderer<T> {
    drawHeartbeats(heartbeats: HeartbeatSpan[]): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color?: string, width?: string|number): T;
    drawRect(x: number, y: number, w: number, h: number, color?: string): T;
    drawText(x: number, y: number, content: string, color?: string, size?: string|number): T;
    addDateLabel(date: Date, pos: number): void;
    addLabel(text: string, pos: number): void;
}

export class SVGTimeRenderer implements TimeRenderer<SVGElement> {
    constructor(
        readonly chartSvg: SVGElement,
        readonly chartLabels: HTMLElement,
        readonly options: DrawSvgOptions,
        readonly barClickEvent: (event: MouseEvent, heartbeat: HeartbeatSpan, x: number, y: number) => void
    ) {}

    drawHeartbeats(heartbeats: HeartbeatSpan[]) {
        const {width, height, scale, offset, showDays, bgColor, barColor, barSize, minutesPerThickLine, hoursPerThickLine, use12HourTime} = this.options;
        this.drawRect(0, 0, width * scale, height * showDays, bgColor);

        // Draw heartbeats
        heartbeats.forEach(heartbeat => {
            const {start_time: start, duration} = heartbeat;
            // const end = heartbeat.end_time;

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
                
                this.drawHeartbeatRect(heartbeat, start, x1 * scale, y, (x2 - x1) * scale, barSize, barColor);

                c++
                if (c > 99) {
                    console.error("Too many iterations, breaking out of loop");
                    break;
                }
            }
        })

        // Draw grid lines
        for (let m = 0; m <= 60; m++) {
            let color = `rgba(255, 255, 255, ${m % minutesPerThickLine === 0 ? 0.25 : 0.125})`;
            let x = m * 60 * scale;
            this.drawLine(x, 0, x, height * showDays, color);
        }
        for (let d = 0; d < showDays; d++) {
            let dayStart = d * SECONDS_PER_DAY + offset;
            let time = heartbeats.filter(h => h.start_time >= dayStart && h.start_time < dayStart + SECONDS_PER_DAY).reduce((a, b) => a + b.duration, 0);
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time % 3600) / 60);
            let thisDay = new Date(dayStart * 1000);

            const dayY = d * 240;
            this.drawLine(0, dayY, width * scale, dayY, "white", 2);
            
            
            this.addDateLabel(thisDay, dayY);
            this.addLabel(`Total: ${hours}h ${minutes}m`, dayY + 20);
            this.drawText(1, dayY, use12HourTime ? "12a" : "0", "#7F7F7F", barSize * 0.75);

            for (let h = 1; h < 24; h++) { // 1 to not overlap day line
                let y = d * 240 + h * barSize;
                this.drawLine(0, y, width * scale, y, "#FFFFFF7F", h % hoursPerThickLine === 0 ? 2 : 1);
                this.drawText(1, y, use12HourTime ? (h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`) : `${h}`, "#7F7F7F", barSize * 0.75);
            }

            if (dayStart > Date.now() / 1000) {
                // can't see the future
                this.drawRect(0, d * 240, width * scale, 240, "#0000007F");
                this.addLabel("In the future", dayY + 40);
            }
            if (dayStart === new Date().setHours(0, 0, 0, 0) / 1000) {
                this.addLabel("Today", dayY + 40);
            }
        }
        this.drawLine(0, showDays * 240, width * scale, showDays * 240, "white", 2);

    }

    drawHeartbeatRect(heartbeat: HeartbeatSpan, time: number, x: number, y: number, w: number, h: number, color: string = "white"): SVGRectElement {
        const rect = this.drawRect(x, y, w, h, color);
        rect.classList.add("heartbeat");
        rect.id = `heartbeat-${time}`;
        rect.addEventListener("click", event => this.barClickEvent(event, heartbeat, x, y));
        return rect;
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: string = "white", width: string|number = 1): SVGLineElement {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.x1.baseVal.value = x1;
        line.y1.baseVal.value = y1;
        line.x2.baseVal.value = x2;
        line.y2.baseVal.value = y2;
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", String(width));
        this.chartSvg.append(line);
        return line;
    }
    drawRect(x: number, y: number, w: number, h: number, color: string = "white"): SVGRectElement {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.x.baseVal.value = x;
        rect.y.baseVal.value = y;
        rect.width.baseVal.value = w;
        rect.height.baseVal.value = h;
        rect.setAttribute("fill", color);
        this.chartSvg.append(rect);
        return rect;
    }
    drawText(x: number, y: number, content: string, color: string = "white", size: string|number = 12): SVGTextElement {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", String(x));
        text.setAttribute("y", String(y + Number(size))); // y is baseline
        text.setAttribute("fill", color);
        text.setAttribute("font-size", String(size));
        text.textContent = content;
        this.chartSvg.append(text);
        return text;
    }

    addDateLabel(date: Date, pos: number) {
        const dateStr = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        return this.addLabel(dateStr, pos);
    }
    addLabel(text: string, pos: number) {
        let label = document.createElement("div");
        label.textContent = text;
        label.classList.add("chart-label");
        label.style.top = `${pos}px`;
        this.chartLabels.append(label);
    }
}