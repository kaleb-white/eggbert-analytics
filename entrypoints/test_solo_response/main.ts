import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Response } from "@/core/entities/surveys/response";
import { Turn } from "@/core/entities/surveys/turn";
import { Respondent } from "@/core/entities/users/respondent";
import { CacheImpl } from "@/core/gateways/external/cpp_socket_cache_impl";
import { PostgresDbImpl } from "@/core/gateways/external/postgres_db_impl";
import { StorageGatewayImpl } from "@/core/gateways/internal/storage_gateway_impl";
import { CacheGatewayImpl } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import {
    blueString,
    greenString,
    magentaString,
    redString,
    yellowString,
} from "@/utilities/logging";
import { isProcessRunningOnPort } from "@/utilities/process_running";
import { initialize } from "@/tests/db/utilities/reset_and_initialize";
import { exec } from "child_process";
import { pool } from "@/injections";

function createStreamEchoingToStdout() {
    const decoder = new TextDecoder("utf-8");
    const echoStream = new WritableStream({
        write(chunk) {
            console.log(decoder.decode(chunk).trimEnd());
        },
    });

    return echoStream;
}

const space2 = "  ";
const space4 = "    ";
const space6 = "      ";
const CACHEPORT = 1037;
const PROXYPORT = 1038;

function printOp(str: string) {
    console.log(space2 + blueString(str));
}

function printSubOp(str: string) {
    console.log(space4 + redString(str));
}

function printOpDone() {
    console.log(space2 + magentaString("Done!"));
}

function printError(spaces: string, str: string) {
    console.log(yellowString(spaces + str));
}

async function killProcessOnPort(port: number): Promise<void> {
    return new Promise((resolve) => {
        // For Unix-like systems
        if (process.platform !== "win32") {
            exec(`fuser -n tcp ${port} -k`, (error) => {
                if (error && error.code !== 1) {
                    // Ignore "no processes found" error
                    console.error(
                        `Error killing process on port ${port}:`,
                        error
                    );
                }
                resolve();
            });
        } else {
            // For Windows
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (stdout) {
                    const pid = stdout.trim().split(/\s+/).pop();
                    if (pid) {
                        exec(`taskkill /PID ${pid} /F`, (killError) => {
                            if (killError) {
                                console.error(
                                    `Error killing process on port ${port}:`,
                                    killError
                                );
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            });
        }
    });
}

async function kill(
    process: Bun.Subprocess | null,
    controller: AbortController,
    port: number
) {
    if (process) {
        try {
            controller.abort();
            process.kill("SIGTERM");
            process.kill("SIGKILL");
            killProcessOnPort(port);

            await Promise.race([
                process.exited,
                new Promise((resolve) => setTimeout(resolve, 2000)),
            ]);
        } catch (error) {
            printError("", "Error terminating subprocesses: " + error);
        }
    }
}

async function main() {
    console.log(
        greenString(
            `Starting with args: ${process.argv.slice(2).join(", ")}...`
        )
    );
    console.log(
        space2 +
            yellowString(
                `Available options: no-cache (don't check if cache running), no-proxy (don't check if proxy running), spawn (try and spawn cache and proxy), windows (running on windows)`
            )
    );

    // Try and start subprocesses
    const spawn = process.argv.includes("spawn");
    const windows = process.argv.includes("windows");
    let proxy: Bun.Subprocess | null = null,
        cache: Bun.Subprocess | null = null;
    // Reference: https://bun.com/docs/runtime/child-process#using-abortsignal
    const proxyController = new AbortController(),
        cacheController = new AbortController();
    if (spawn) {
        printSubOp(`Killing processes on 1037, 1038...`);
        killProcessOnPort(1037);
        killProcessOnPort(1038);
        printOpDone();

        printSubOp(
            `Trying to start cache${windows ? " (windows)" : " (linux)"}...`
        );
        if (windows) {
            cache = Bun.spawn(
                ["storage\\cpp_cache\\socket_cache_windows.exe", "-v=1"],
                {
                    signal: cacheController.signal,
                }
            );
        } else {
            cache = Bun.spawn(
                ["../../storage/cpp_cache/socket_cache_linux.exe"],
                {
                    signal: cacheController.signal,
                }
            );
        }

        printSubOp(`Trying to start proxy...`);
        if (windows) {
            proxy = Bun.spawn(["bun", "run", "model_client_proxy\\main.ts"], {
                signal: proxyController.signal,
            });
        } else {
            proxy = Bun.spawn(
                ["bun", "run", "../../model_client_proxy/main.ts"],
                {
                    signal: proxyController.signal,
                }
            );
        }

        printOpDone();

        printOp(`Adding exit listener to shut subprocesses...`);
        process.on("beforeExit", async () => {
            printOp("Shutting down subprocesses...");

            printSubOp("Killing cache...");
            kill(cache, cacheController, 1037);

            printSubOp("Killing proxy...");
            kill(proxy, proxyController, 1038);
            printOpDone();
        });
        printOpDone();
    } else {
        // Check if subprocesses exist
        const noCache = process.argv.includes("no-cache");
        const noProxy = process.argv.includes("no-proxy");

        if (!noCache || !noProxy) {
            printOp(`Checking if required processes exist...`);
            if (!noCache && !isProcessRunningOnPort(CACHEPORT)) {
                printError(
                    space4,
                    `Cache is not running on port ${CACHEPORT}! Either start the cache or change the port to the expected port.`
                );
                process.exit();
            }
            if (!noProxy && !isProcessRunningOnPort(PROXYPORT)) {
                printError(
                    space4,
                    `Proxy is not running on port ${PROXYPORT}! Either start the proxy or change the port to the expected port.`
                );
                process.exit();
            }
            printOpDone();
        }
    }

    // Reset db
    printOp("Resetting test database...");
    await initialize();
    printOpDone();

    // Create sample question response and save
    printOp("Creating a sample response in progress and saving it...");
    printSubOp("Creating sample response...");
    const question1 = new Question({ uniqueId: "1", question: "Question one" });
    const question2 = new Question({ uniqueId: "2", question: "Question two" });
    const question3 = new Question({
        uniqueId: "3",
        question: "Question three",
    });
    const question4 = new Question({
        uniqueId: "4",
        question: "Question four",
    });
    const question5 = new Question({
        uniqueId: "5",
        question: "Question five",
    });
    const qr1 = new QuestionResponse({
        uniqueId: "test1",
        question: question1,
        transcript: [
            new Turn({
                uniqueId: "a",
                modelMessage: "model msg 1.1",
                respondentMessage: "resp msg 1.1",
            }),
            new Turn({ uniqueId: "b", modelMessage: "model msg 2.1" }),
        ],
    });
    const qr2 = new QuestionResponse({
        uniqueId: "test2",
        question: question2,
        transcript: [
            new Turn({
                uniqueId: "c",
                modelMessage: "model msg 1.2",
                respondentMessage: "resp msg 1.2",
            }),
            new Turn({ uniqueId: "d", modelMessage: "model msg 2.2" }),
        ],
    });
    const qr3 = new QuestionResponse({
        uniqueId: "test3",
        question: question3,
        transcript: [
            new Turn({
                uniqueId: "e",
                modelMessage: "model msg 1.3",
                respondentMessage: "resp msg 1.3",
            }),
            new Turn({ uniqueId: "f", modelMessage: "model msg 2.3" }),
        ],
    });
    const qr4 = new QuestionResponse({
        uniqueId: "test4",
        question: question4,
        transcript: [
            new Turn({
                uniqueId: "g",
                modelMessage: "model msg 1.4",
                respondentMessage: "resp msg 1.4",
            }),
            new Turn({ uniqueId: "h", modelMessage: "model msg 2.4" }),
        ],
    });
    const qr5 = new QuestionResponse({
        uniqueId: "test5",
        question: question5,
        transcript: [
            new Turn({
                uniqueId: "i",
                modelMessage: "model msg 1.5",
                respondentMessage: "resp msg 1.5",
            }),
            new Turn({ uniqueId: "j", modelMessage: "model msg 2.5" }),
        ],
    });
    const qrs = [qr1, qr2, qr3, qr4, qr5];
    const res = new Response({
        uniqueId: "test",
        questionResponses: qrs,
        respondent: new Respondent("test6"),
    });

    printSubOp("Creating storage gateway...");
    const cacheGateway = new CacheGatewayImpl();
    const cacheImpl = new CacheImpl(cacheGateway);
    const db = new PostgresDbImpl(pool);
    const storage = new StorageGatewayImpl(cacheImpl, db);

    printOp("Saving sample response...");
    const storeResult = await storage.save(res.uniqueId, res);
    if (storeResult instanceof Error) {
        printError(
            space6,
            "Error while saving response: " + storeResult.message
        );
        printError("", "Exiting...");
        process.exit();
    }
    printOpDone();

    if (spawn) {
        printOp("Confirming that subprocesses are still running...");
        printSubOp("Checking proxy...");
        if (!proxy) {
            printError(space6, "Proxy not found! Exiting...");
            process.exit();
        }
        if (proxy.killed) {
            printError(
                space6,
                "Proxy was killed! Exiting... (Try again in a few minutes. If the issue persists, contact kaleboppwhite@gmail.com)"
            );
            process.exit();
        }
        printSubOp("Checking cache...");
        if (!cache) {
            printError(space6, "Cache not found! Exiting...");
            process.exit();
        }
        if (cache.killed) {
            printError(
                space6,
                "Cache was killed! Exiting... (Try again in a few minutes. If the issue persists, contact kaleboppwhite@gmail.com)"
            );
            process.exit();
        }
        printOpDone();
    }

    console.log(redString("Go to http://localhost:3000/responses/test"));
    console.log(magentaString("Running next..."));
    const nextDevProcess = Bun.spawn(["next", "dev", "--turbopack"], {
        env: { ...process.env, NODE_ENV: "development" },
    });

    process.on("SIGINT", async () => {
        if (spawn) {
            console.log("\n");
            printOp("Shutting down subprocesses...");

            printSubOp("Killing cache...");
            kill(cache, cacheController, 1037);

            printSubOp("Killing proxy...");
            kill(proxy, proxyController, 1038);

            printOpDone();
        }
        printOp("Killing next...");
        nextDevProcess.kill();
        printOpDone();
        console.log(
            greenString(
                "Bye! Please wait a minute or two before restarting so all ports are available again."
            )
        );
        process.exit();
    });

    nextDevProcess.stdout.pipeTo(createStreamEchoingToStdout());
}

await main();
