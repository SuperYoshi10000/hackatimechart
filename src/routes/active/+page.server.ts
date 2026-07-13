import { API_ACTIVE_URL } from "$env/static/private";
import type { ActiveUsers, Leaderboard } from "$lib/types.js";

export async function load({ url }) {
    const max = url.searchParams.has("max") ? Number(url.searchParams.get("max")) : 100;
    const page = url.searchParams.has("page") ? Number(url.searchParams.get("page")) : 1;

    const activeReq = fetch(API_ACTIVE_URL).then(res => res.json()).then((activeUsers: ActiveUsers) => {
        if (page > 1) {
            activeUsers.users.splice(0, (page - 1) * max);
        }
        if (activeUsers.users.length > max && max >= 0) {
            activeUsers.users.length = max;
        }
        return activeUsers;
    });

    return activeReq;
}