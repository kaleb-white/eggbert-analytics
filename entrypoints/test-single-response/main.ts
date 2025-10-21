function createStreamEchoingToStdout() {
    const decoder = new TextDecoder("utf-8");
    const echoStream = new WritableStream({
        write(chunk) {
            console.log(decoder.decode(chunk).trimEnd());
        },
    });

    return echoStream;
}

async function main() {
    const nextDevProcess = Bun.spawn(["next", "dev", "--turbopack"]);
    nextDevProcess.stdout.pipeTo(createStreamEchoingToStdout());
}

await main();

export {};
