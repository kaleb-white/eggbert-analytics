import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Turn } from "@/core/entities/surveys/turn";
import { CacheImpl } from "@/core/gateways/external/cpp_socket_cache_impl";
import { PostgresDbImpl } from "@/core/gateways/external/postgres_db_impl";
import { StorageGatewayImpl } from "@/core/gateways/internal/storage_gateway_impl";
import { CacheGatewayImpl } from "@/persistent_storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import {
    blueString,
    greenString,
    magentaString,
    redString,
    yellowString,
} from "@/stable_utilities/logging";
import { initialize } from "@/tests/db/utilities/reset_and_initialize";
import testPool from "@/tests/db/utilities/test_pool";

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

function printOp(str: string) {
    console.log(space2 + blueString(str));
}

function printOpDone() {
    console.log(space2 + magentaString("Done!"));
}

async function main() {
    console.log(greenString("Starting..."));

    // Spawn subprocesses
    printOp("Spawning proxy and cache...");
    const cacheProc = Bun.spawn(["bun", "run", "cache"]);
    console.log(space4 + redString("Spawned cache..."));
    console.log(space4 + redString("Spawned proxy..."));
    const proxyProc = Bun.spawn(["bun", "run", "proxy-dev"]);
    printOpDone();

    printOp("Waiting ten seconds to allow processes to spin up...");
    await new Promise<void>((res) =>
        setTimeout(() => {
            res();
        }, 5000)
    );
    printOpDone();

    // Reset db
    printOp("Resetting test database...");
    await initialize();
    printOpDone();

    // Create sample question response and save
    printOp("Creating a sample question response in progress and saving it...");
    console.log(space4 + redString("Creating sample question response..."));
    const question = new Question("", "This is a model prompt!");
    const qr = new QuestionResponse("test", question, [
        new Turn("a", "model msg 1", "resp msg 1"),
        new Turn("b", "model msg 2"),
    ]);

    console.log(space4 + redString("Creating storage gateway..."));
    const cacheGateway = new CacheGatewayImpl();
    const cache = new CacheImpl(cacheGateway);
    const db = new PostgresDbImpl(testPool);
    const storage = new StorageGatewayImpl(cache, db);

    printOp("Saving sample question response...");
    const storeResult = await storage.save(qr.uniqueId, qr);
    if (storeResult instanceof Error) {
        console.log(
            space6 +
                yellowString("Error while saving question response: ") +
                storeResult.message
        );
        console.log(redString("Killing cache..."));
        cacheProc.kill(1);
        console.log(redString("Killing proxy..."));
        proxyProc.kill(1);
        console.log(yellowString("Exiting..."));
        process.exit();
    }
    printOpDone();

    console.log(redString("Go to http://localhost:3000/responses/test"));
    console.log(magentaString("Running next..."));
    const nextDevProcess = Bun.spawn(["next", "dev", "--turbopack"]);

    process.on("SIGINT", () => {
        console.log(redString("Killing next..."));
        nextDevProcess.kill(0);
        console.log(redString("Killing cache..."));
        cacheProc.kill(0);
        console.log(redString("Killing proxy..."));
        proxyProc.kill(0);
        console.log(greenString("Bye!"));
        process.exit(0);
    });

    nextDevProcess.stdout.pipeTo(createStreamEchoingToStdout());
}

await main();

export {};
