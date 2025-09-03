import { RedisClientType } from "@redis/client";
import { SyncSubprocess } from "bun";
import { createClient } from "redis";

function exit() {
    process.exit(1);
}

function printRed(str: string): string {
    return `\u001b[31m${str}\u001b[0m`;
}

function printGreen(str: string): string {
    return `\u001b[32m${str}\u001b[0m`;
}

enum OperatingSystems {
    WINDOWS = "win32",
    LINUX = "linux",
    MAC = "darwin",
}
function determineOS(): OperatingSystems {
    const os = process.platform;
    switch (os) {
        case OperatingSystems.WINDOWS:
            return OperatingSystems.WINDOWS;
        case OperatingSystems.LINUX:
            return OperatingSystems.LINUX;
        case OperatingSystems.MAC:
            return OperatingSystems.MAC;
    }
}

function printSubprocessIO(subprocess: SyncSubprocess) {
    function splitAndAddTabs(
        numTabs: number,
        str: string,
        stdout: boolean = false
    ) {
        const splitByLineTerminator = str
            .split("\n")
            .map((line) => `${"\t".repeat(numTabs)}${line}`);

        // Cut off unnecessary stdout output (such as from docker info)
        let sliced;
        if (stdout) sliced = splitByLineTerminator.slice(0, 10);
        else sliced = splitByLineTerminator;

        // Show that stdout was sliced
        if (sliced.length < splitByLineTerminator.length) {
            sliced = sliced.concat(["\t..."]);
        }

        return sliced.join("\n").trimEnd();
    }

    if (subprocess.stdout && subprocess.stdout.toString() !== "") {
        console.log(
            `${printGreen("stdout:")}\n${splitAndAddTabs(
                1,
                subprocess.stdout.toString(),
                true
            )}`
        );
    }

    if (subprocess.stderr && subprocess.stderr.toString() !== "") {
        console.log(
            `${printRed("stderr:")}\n${splitAndAddTabs(
                1,
                subprocess.stderr.toString()
            )}`
        );
    }
}

function testExistenceOfDocker(): boolean {
    console.log("Testing the existence of docker (checking path)...");

    // Look for path vars that contain the docker executable
    const DOCKER_EXECUTABLE_WINDOWS = `${String.fromCharCode(
        92
    )}Docker${String.fromCharCode(92)}resources${String.fromCharCode(92)}bin`;
    const DOCKER_EXECUTABLE_LINUX_MAC = `/Docker/resources/bin`;
    const path_vars = (process.env.PATH as string).split(";");
    if (
        !path_vars.some(
            (executable) =>
                executable.includes(DOCKER_EXECUTABLE_LINUX_MAC) ||
                executable.includes(DOCKER_EXECUTABLE_WINDOWS)
        )
    ) {
        console.log(printRed("Failed to find docker executable in PATH!"));
        return false;
    }
    // Call which to see if the executable is found
    const whichResult = Bun.spawnSync(["which", "docker"]).stdout.toString();
    if (
        !(
            whichResult.includes(DOCKER_EXECUTABLE_LINUX_MAC) ||
            !whichResult.includes(DOCKER_EXECUTABLE_WINDOWS)
        )
    ) {
        console.log(
            printRed(
                'Result of cmd "which docker" did not contain Docker exectuable!'
            )
        );
        return false;
    }
    console.log(printGreen("Docker executable found!"));
    return true;
}

function testDockerDaemonRunning(): boolean | Error {
    console.log("Testing if the docker daemon is running (via docker info)...");
    const dockerSpawnSubprocess = Bun.spawnSync(["docker", "info"]);
    printSubprocessIO(dockerSpawnSubprocess);
    if (
        dockerSpawnSubprocess.stderr
            .toString()
            .includes("The system cannot find the file specified")
    )
        return new Error("Failed to connect");
    return true;
}

function runDockerStartCommandBasedOnOS(): SyncSubprocess {
    const os = determineOS()
    switch (os) {
        case OperatingSystems.LINUX:
            return Bun.spawnSync(["sudo", "systemctl", "start", "docker"])
        case
    }

}

function startOrConfirmDockerDaemon(): boolean | Error {
    console.log(
        "Trying to start the docker daemon or confirm that it's running (via dockerd)..."
    );
    const testDockerDaemon = testDockerDaemonRunning();
    if (testDockerDaemon instanceof Error) {
        try {
            printSubprocessIO(Bun.spawnSync(["systemctl", "start", "docker"]));
        } catch (err) {
            return err as Error;
        }
    }
    console.log(printGreen("Docker daemon is running!"));
    return true;
}

function createRedisProcess(): boolean | Error {
    console.log("Trying to create an instance of redis on port 6379...");
    printSubprocessIO(
        Bun.spawnSync("docker run -p 6379:6379 -d redis:8.0-rc1".split(" "))
    );
    return true;
}

async function connectClientToRedis() {
    console.log("Trying to connect a client to the redis instance...");
    const client = createClient();
    await client.connect();
    if (!client.isReady) return new Error("Failed to connect");
    console.log(printGreen("Connected a client to redis instance!"));
    return client;
}

async function AuthUser(clientUntyped: unknown): Promise<string | Error> {
    console.log("Trying to authorize a redis user...");
    const client = clientUntyped as RedisClientType;
    const pass = await client.aclGenPass(8 * 32);
    await client.sendCommand(["ACL", "SETUSER", "superuser", "on", `>${pass}`]);
    if ((await client.aclUsers()).length < 1)
        return new Error("Failed to auth user");
    console.log(printGreen("Verified that only one user exists!"));
    return pass;
}

async function startRedis(): Promise<
    { username: string; password: string } | Error
> {
    console.log("Trying to start redis...");
    const tryCreateProcess = createRedisProcess();
    if (tryCreateProcess instanceof Error) return tryCreateProcess;

    const client = await connectClientToRedis();
    if (client instanceof Error) return client;

    const tryAuthUser = await AuthUser(client);
    if (tryAuthUser instanceof Error) return tryAuthUser;

    console.log(await client.ping());

    return { username: "superuser", password: tryAuthUser };
}

async function main() {
    if (!testExistenceOfDocker()) {
        console.log(
            "Docker not found! Docker and the docker daemon and dependencies for any redis-based cache implementation."
        );
        exit();
    }

    const tryStartDockerDaemon = startOrConfirmDockerDaemon();
    if (tryStartDockerDaemon instanceof Error) {
        console.log(tryStartDockerDaemon.message);
    }

    const tryStartRedis = await startRedis();
    if (tryStartRedis instanceof Error) {
        console.log(tryStartRedis.message);
        console.log(printRed("Failed to connect to redis!"));
        exit();
    }
}

await main();

export {};
