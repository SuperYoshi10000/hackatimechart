import { API_LEADERBOARD_DAILY_URL, API_LEADERBOARD_WEEKLY_URL } from "$env/static/private";
import type { Leaderboard } from "$lib/types.js";
import { error } from "@sveltejs/kit";

export async function load({ params, url }) {
    const when = params.when.toLowerCase();
    const leaderboardUrl = when === "daily" || when === "day" || when === "d" ? API_LEADERBOARD_DAILY_URL
        : when === "weekly" || when === "week" || when === "w" ? API_LEADERBOARD_WEEKLY_URL : null;
    if (!leaderboardUrl) error(404, `Leaderboard for time range ${params.when} not found`);

    const max = url.searchParams.has("max") ? Number(url.searchParams.get("max")) : 100;
    const page = url.searchParams.has("page") ? Number(url.searchParams.get("page")) : 1;

    const leaderboardReq = fetch(leaderboardUrl).then(res => res.json()).then((leaderboard: Leaderboard) => {
        if (page > 1) {
            leaderboard.entries.splice(0, (page - 1) * max);
        }
        if (leaderboard.entries.length > max && max >= 0) {
            leaderboard.entries.length = max;
        }
        return leaderboard;
    });

    return leaderboardReq;
}