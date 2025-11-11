import { pool } from "@/injections";
import { InitializerImpl } from "./initializer_impl";

console.log(
    "Continuing will cause all tables to be dropped. Are you sure you want to continue? Enter Y/y to continue"
);
process.stdin.on("data", async (data) => {
    const input = data.toString().trim();
    if (input == "Y" || input == "y") {
        await main();
    }
});

async function main() {
    const i = new InitializerImpl(pool);
    i.initialize();
}
