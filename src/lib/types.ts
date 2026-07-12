export interface HeartbeatSpanList {
    spans: HeartbeatSpan[];
}
export interface HeartbeatSpan {
    // API properties
    duration: any;
    start_time: number;
    end_time: number;
    // Added properties
    project?: string;
    color?: string;
}
export type AllHeartbeats = [string, HeartbeatSpan[]][];

export interface Project {
    name: string,
    total_seconds: number,
    languages: string[],
    repo_url: string,
    total_heartbeats: number,
    first_heartbeat: string,
    last_heartbeat: string
}

export interface UserStats {
    data: {
        total_seconds: number;
        daily_average: number;
        languages: StatDataPart[];
        projects: StatDataPart[];
        editors: StatDataPart[];
        streak: number;
        unique_total_seconds: number;
    } | null;
    trust_factor: {
        trust_level: "blue" | "red" | "green"; // "yellow" is not given through public API
        trust_value: 0 | 1 | 2;
    };
}
export interface StatDataPart {
    name: string;
    total_seconds: number;
    percent: number;
}