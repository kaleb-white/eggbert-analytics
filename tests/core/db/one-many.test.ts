import {
    RequiredUniqueId,
    insertOrUpdateOneManyRelation,
} from "@/persistent_storage/postgres_db/sql_generators_by_table/one-many_tables";
import { describe, expect, test } from "bun:test";
import { truncateSql } from "../../testing_utilities";

describe("test one-many sql generation", () => {
    describe("test insertOrUpdateOneManyRelation", () => {
        type testObj = {
            uniqueId: string;
            childObjs: Array<RequiredUniqueId>;
        };

        const tableName = "myTable",
            oneUniqueIdCol = "one",
            manyUniqueIdCol = "many";

        const basicTestObjZero: testObj = {
            uniqueId: "testParent",
            childObjs: [],
        };

        const expectedOutputZero = "pass";

        const basicTestObjOne: testObj = {
            uniqueId: "testParent",
            childObjs: [{ uniqueId: "1" }],
        };

        const expectedOutputOne = `
            INSERT INTO ${tableName} (${oneUniqueIdCol}, ${manyUniqueIdCol})
                VALUES (${basicTestObjOne.uniqueId}, ${basicTestObjOne.childObjs[0].uniqueId})
                ON CONFLICT (${oneUniqueIdCol}, ${manyUniqueIdCol}) DO NOTHING;
        `;

        const basicTestObjTwo: testObj = {
            uniqueId: "testParent",
            childObjs: [{ uniqueId: "1" }, { uniqueId: "2" }],
        };

        const expectedOutputTwo = `
            INSERT INTO ${tableName} (${oneUniqueIdCol}, ${manyUniqueIdCol})
                VALUES (${basicTestObjTwo.uniqueId}, ${basicTestObjTwo.childObjs[0].uniqueId}), (${basicTestObjTwo.uniqueId}, ${basicTestObjTwo.childObjs[1].uniqueId})
                ON CONFLICT (${oneUniqueIdCol}, ${manyUniqueIdCol}) DO NOTHING;
        `;

        test("0", () => {
            const res = insertOrUpdateOneManyRelation(
                oneUniqueIdCol,
                manyUniqueIdCol,
                tableName,
                basicTestObjZero,
                "childObjs"
            );
            expect(truncateSql(res as string)).toBe(
                truncateSql(expectedOutputZero)
            );
        });

        test("1", () => {
            const res = insertOrUpdateOneManyRelation(
                oneUniqueIdCol,
                manyUniqueIdCol,
                tableName,
                basicTestObjOne,
                "childObjs"
            );
            expect(truncateSql(res as string)).toBe(
                truncateSql(expectedOutputOne)
            );
        });

        test("2", () => {
            const res = insertOrUpdateOneManyRelation(
                oneUniqueIdCol,
                manyUniqueIdCol,
                tableName,
                basicTestObjTwo,
                "childObjs"
            );
            expect(truncateSql(res as string)).toBe(
                truncateSql(expectedOutputTwo)
            );
        });
    });
});
