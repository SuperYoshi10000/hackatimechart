import { API_PROJECT_URL, API_HEARTBEAT_URL } from "$env/static/private";
import util from 'util';

export async function load({params}) {
    const {user, name} = params;
    const projectUrl = util.format(API_PROJECT_URL, user, name);
    const heartbeatUrl = util.format(API_HEARTBEAT_URL, user);

    const project: Project = await fetch(projectUrl).then(res => res.json());

    const heartbeats: HeartbeatSpanList = await fetch(heartbeatUrl).then(res => res.json());
    heartbeats.spans = heartbeats.spans.filter(span => span.project === name);

    return {
        ...project,
        heartbeats: heartbeats.spans,
    }
}