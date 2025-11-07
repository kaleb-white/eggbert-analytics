export function spawnAsyncTestServer() {
    Bun.spawn({
        cmd: [
            "bun",
            "run",
            "./tests/model_client_proxy/run_test_server/test_server.ts",
        ],
        stdout: "inherit",
    });
}
