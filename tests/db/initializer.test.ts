import { CacheImpl } from "@/core/gateways/external/cpp_socket_cache_impl";
import { PostgresDbImpl } from "@/core/gateways/external/postgres_db_impl";
import { StorageGatewayImpl } from "@/core/gateways/internal/storage_gateway_impl";
import { CacheGatewayImpl } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { InitializerImpl } from "@/storage/postgres_db/initialization/initializer_impl";
import { describe, expect, test } from "bun:test";
import { Pool } from "pg";
import { sampleSurvey } from "./utilities/sample_data";
import { Survey } from "@/core/entities/surveys/survey";
import { Author } from "@/core/entities/users/author";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponse } from "@/core/entities/surveys/question_response";

describe("test test initializer", () => {
    const pool = new Pool({
        database: "test_initializer",
        host: process.platform == "win32" ? "localhost" : process.env.PGHOST,
    });
    const i = new InitializerImpl(pool);
    const storage = new StorageGatewayImpl(
        new CacheImpl(new CacheGatewayImpl()),
        new PostgresDbImpl(pool)
    );
    test.serial("initialize should not error", async () => {
        const results = await i.initialize();
        expect(results).toBeNull();
    });

    test.serial(
        "truncate should not error and should remove rows",
        async () => {
            const foreignKey = sampleSurvey.author;
            const child = sampleSurvey.responses[0];
            const subchild = child.questionResponses[0];

            const saveResult = await storage.save(
                sampleSurvey.uniqueId,
                sampleSurvey
            );
            expect(saveResult).not.toBeInstanceOf(Error);

            const truncateResult = await i.removeAllRows();
            expect(truncateResult).not.toBeInstanceOf(Error);

            const isSurveyStillSaved = await storage.get(
                sampleSurvey.uniqueId,
                new Survey()
            );
            expect(isSurveyStillSaved).toBeNull();

            const isForeignKeyStillSaved = await storage.get(
                foreignKey.uniqueId,
                new Author()
            );
            expect(isForeignKeyStillSaved).toBeNull();

            const isChildSaved = await storage.get(
                child.uniqueId,
                new Response()
            );
            expect(isChildSaved).toBeNull();

            const isSubChildSaved = await storage.get(
                subchild.uniqueId,
                new QuestionResponse()
            );
            expect(isSubChildSaved).toBeNull();
        }
    );
});
