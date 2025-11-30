// import { string } from "zod/v4";
// import { createParameterizedStatement } from "./storage/postgres_db/generation_types_and_utilities";
// import testPool from "./tests/db/utilities/test_pool";

import { readFileSync } from "node:fs";
import {
    rawTsxOutputFilePath,
    usableTsxOutputFilePath,
} from "./ui/icons/create_icons_config";

// const insertResult1 = await testPool.query(`
// INSERT INTO
// 	SESSIONS (UNIQUEID, ANTICSRFTOKEN, USERID, ROLE, EXPIRATION)
// VALUES
// 	('abc', 'abc', 'user', 'anonymous', 12345);
//     `);
// const insertResult2 = await testPool.query(`
// INSERT INTO
// 	SESSIONS (UNIQUEID, ANTICSRFTOKEN, USERID, ROLE, EXPIRATION)
// VALUES
// 	('bcd', 'abc', 'user', 'anonymous', 12345);
//     `);

// const deleteResult = await testPool.query(
//     `
// DELETE FROM sessions
// WHERE sessions.uniqueId IN ('abc', 'bcd')
// RETURNING sessions.uniqueId;
//     `
// );

// console.log(JSON.stringify(insertResult1));
// console.log(JSON.stringify(deleteResult));

// const strings = ["a", "b", "C"];
// console.log(createParameterizedStatement(strings.length, 2 * strings.length));

console.log(readFileSync(usableTsxOutputFilePath, "ascii"));
