export function db_debug() {
    return process.env.DB_DEBUG && process.env.DB_DEBUG == "1";
}

export function proxy_debug() {
    return process.env.PROXY_DEBUG && process.env.PROXY_DEBUG == "1";
}
