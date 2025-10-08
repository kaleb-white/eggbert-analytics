export function db_debug() {
    return process.env.DB_DEBUG && process.env.DB_DEBUG == "1";
}
