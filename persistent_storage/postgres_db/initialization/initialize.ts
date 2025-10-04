import { statements } from "./sql";
import pool from "../pool";

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
    for (const statement of Object.keys(statements)) {
        console.log(`  Running ${statement} command...`);
        try {
            await pool.query(statements[statement]);
        } catch (err) {
            if (statement.includes("create")) {
                console.log("Error in", statement, ":", err);
            }
        }
    }
}
