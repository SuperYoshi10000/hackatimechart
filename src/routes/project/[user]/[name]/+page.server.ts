import { API_PROJECT_URL, API_HEARTBEAT_URL } from "$env/static/private";
import type { Project, HeartbeatSpanList } from "$lib/types";
import util from 'util';

export async function load({url, params}) {
    const {user, name} = params;

    const projectUrl = util.format(API_PROJECT_URL, user, name);
    const heartbeatUrl = util.format(API_HEARTBEAT_URL, user, name);

    const project: Project = await fetch(projectUrl).then(res => res.json());

    const heartbeats: HeartbeatSpanList = await fetch(heartbeatUrl).then(async res => {
        if (res.ok) return res.json();
        throw new Error(`Failed to fetch heartbeats: ${res.status} ${res.statusText}:\n${await res.text()}`);
    });

    

    return {
        ...project,
        heartbeats: heartbeats.spans,
    }
}