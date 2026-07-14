import { API_USER_STATS_URL, API_USER_SUMMARY_URL } from "$env/static/private";
import util from 'util';

export async function load({ params }) {
    const summaryUrl = util.format(API_USER_SUMMARY_URL, params.user);
    const summary = await fetch(summaryUrl).then(res => {
        if (res.ok) return res.json();
        return res.status;
    });

    if (typeof summary === "number") return { status: summary };

    const statsUrl = util.format(API_USER_STATS_URL, params.user);
    const stats = await fetch(statsUrl).then(res => {
        if (res.ok) return res.json();
        return res.status;
    });

    if (typeof stats === "number") return { status: stats };

    return {
        ...summary,
        ...stats,
        status: 200
    };
}