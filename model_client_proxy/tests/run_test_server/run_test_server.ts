export function spawnAsyncTestServer() {
    Bun.spawn({
        cmd: ["bun", "run", "./tests/run_test_server/test_server.ts"],
        stdout: "inherit",
    });
}
