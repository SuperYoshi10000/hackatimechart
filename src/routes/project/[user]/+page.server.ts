import { API_PROJECT_URL, API_PROJECT_NAMES_URL, API_USER_STATS_URL, API_TRUST_FACTOR_URL, API_HEARTBEAT_URL, API_PROJECT_DETAILS_URL } from "$env/static/private";
import type { HeartbeatSpan, HeartbeatSpanList, UserStats } from "$lib/types";
import util from 'util';

export async function load({url, params}) {
    const {user} = params;
    
    const statsUrl = util.format(API_USER_STATS_URL, user);
    const stats: UserStats = await fetch(statsUrl).then(res => {
        if (res.ok) return res.json();
        if (res.status !== 403) return;
        // 403 = User disabled public stats lookup, but trust factor is always available
        const trustFactorUrl = util.format(API_TRUST_FACTOR_URL, user);
        return fetch(trustFactorUrl).then(res => ({
            data: null,
            trust_factor: res.json(),
        }));
    });

    if (stats.data == null) return {
        ...stats,
        allHeartbeats: {}
    };
    

    let projectNames: string[];
    if (url.searchParams.has("start")) {
        const range = url.searchParams.get("start");
        const projectDetailsUrl = util.format(API_PROJECT_DETAILS_URL, user) + (range !== "all" ? `?start=${range}` : "");
        const projects: { name: string }[] = (await fetch(projectDetailsUrl).then(res => res.json())).projects;
        projectNames = projects.map(p => p.name);
    } else {
        const projectNamesUrl = util.format(API_PROJECT_NAMES_URL, user);
        projectNames = (await fetch(projectNamesUrl).then(res => res.json())).projects;
    }



    const allHeartbeats = (await Promise.allSettled(projectNames.map<Promise<[string, HeartbeatSpan[]]>>(async name => {
        const heartbeatUrl = util.format(API_HEARTBEAT_URL, user, name);
        const heartbeats: HeartbeatSpanList = await fetch(heartbeatUrl).then(async res => {
            if (res.ok) return res.json();
            throw new Error(`Failed to fetch heartbeats: ${res.status} ${res.statusText}:\n${await res.text()}`);
        });
        return [name, heartbeats.spans];
    }))).filter(r => r.status === "fulfilled").map(r => r.value);    

    return {
        ...stats,
        allHeartbeats,
    }
}