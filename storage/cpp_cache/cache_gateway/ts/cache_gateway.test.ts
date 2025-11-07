import { describe, expect, test } from "bun:test";

import { CacheGatewayImpl } from "./cache_gateway_impl";
import type { CacheGateway } from "./cache_gateway";

describe("test cache_gateway", async () => {
    const cache: CacheGateway = new CacheGatewayImpl();

    test("connect", async () => {
        const connect_result = await cache.connect();
        expect(connect_result).toBe(null);
    });

    test("create small id", async () => {
        const create_res = await cache.create("a", "bc");
        expect(create_res).toBe(null);
    });

    test("create large id length 10000", async () => {
        const id = "a".repeat(5000);
        const val = "bc".repeat(2500);
        const create_res = await cache.create(id, val);
        expect(create_res).toBe(null);
    });

    test("read small id", async () => {
        const read_res = await cache.read("a");
        expect(read_res).toBe("bc");
    });

    test("read large id length 10000", async () => {
        const read_res = await cache.read("a".repeat(5000));
        expect(read_res).toBe("bc".repeat(2500));
    });

    test("read nonexistent id fails", async () => {
        const read_res = await cache.read("abc");
        expect(read_res).toBeInstanceOf(Error);
    });

    test("delete small id", async () => {
        const delete_res = await cache.delete("a");
        expect(delete_res).toBe(null);
    });

    test("delete large id length 10000", async () => {
        const delete_res = await cache.delete("a".repeat(5000), true);
        expect(delete_res).toBe(null);
    });
});
