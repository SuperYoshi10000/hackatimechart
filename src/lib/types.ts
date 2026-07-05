interface HeartbeatSpanList {
    spans: HeartbeatSpan[];
}
interface HeartbeatSpan {
    duration: any;
    start_time: number;
    end_time: number;
    project?: string;
}

interface Project {
  name: string,
  total_seconds: number,
  languages: string[],
  repo_url: string,
  total_heartbeats: number,
  first_heartbeat: string,
  last_heartbeat: string
}