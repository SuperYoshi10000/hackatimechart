import { API_BANNED_USERS_URL } from "$env/static/private";

export async function load() {
    return fetch(API_BANNED_USERS_URL).then(res => res.json());
}