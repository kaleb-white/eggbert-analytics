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
const CACHEPORT = 1037;
const PROXYPORT = 1038;

function printOp(str: string) {
    console.log(space2 + blueString(str));
}

function printOpDone() {
    console.log(space2 + magentaString("Done!"));
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
                `Available options: no-cache (don't check if cache running), no-proxy (don't check if proxy running)`
            )
    );

    // Spawn subprocesses
    const noCache = process.argv.includes("no-cache");
    const noProxy = process.argv.includes("no-proxy");

    if (!noCache || !noProxy) {
        printOp(`Checking if required processes exist...`);
        if (!noCache && !isProcessRunningOnPort(CACHEPORT)) {
            console.log(
                space4 +
                    yellowString(
                        `Cache is not running on port ${CACHEPORT}! Either start the cache or change the port to the expected port.`
                    )
            );
            process.exit();
        }
        if (!noProxy && !isProcessRunningOnPort(PROXYPORT)) {
            console.log(
                space4 +
                    yellowString(
                        `Proxy is not running on port ${PROXYPORT}! Either start the proxy or change the port to the expected port.`
                    )
            );
            process.exit();
        }
        printOpDone();
    }

    // Reset db
    printOp("Resetting test database...");
    await initialize();
    printOpDone();

    // Create sample question response and save
    printOp("Creating a sample response in progress and saving it...");
    console.log(space4 + redString("Creating sample response..."));
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

    console.log(space4 + redString("Creating storage gateway..."));
    const cacheGateway = new CacheGatewayImpl();
    const cache = new CacheImpl(cacheGateway);
    const db = new PostgresDbImpl(testPool);
    const storage = new StorageGatewayImpl(cache, db);

    printOp("Saving sample response...");
    const storeResult = await storage.save(res.uniqueId, res);
    if (storeResult instanceof Error) {
        console.log(
            space6 +
                yellowString("Error while saving response: ") +
                storeResult.message
        );
        console.log(yellowString("Exiting..."));
        process.exit();
    }
    printOpDone();

    console.log(redString("Go to http://localhost:3000/responses/test"));
    console.log(magentaString("Running next..."));
    const nextDevProcess = Bun.spawn(["next", "dev", "--turbopack"]);

    process.on("SIGINT", () => {
        console.log(greenString("Bye!"));
        process.exit();
    });

    nextDevProcess.stdout.pipeTo(createStreamEchoingToStdout());
}

await main();

export {};
