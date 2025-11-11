import { CacheGatewayImpl } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { CacheImpl } from "./core/gateways/external/cpp_socket_cache_impl";
import { PostgresDbImpl } from "./core/gateways/external/postgres_db_impl";
import { StorageGatewayImpl } from "./core/gateways/internal/storage_gateway_impl";
import { CryptographyUtilitiesImpl } from "./core/controllers/crypto/crypto_utility_creator_impl";
import { Pool } from "pg";
import { RandomGeneratorImpl } from "./core/controllers/crypto/random_buffer_generator_impl";

export const pool = new Pool({
    database: process.env.PGTESTDATABASE, // Change to PGDATABASE for prod
    host: process.platform == "win32" ? "localhost" : process.env.PGHOST,
});

const cacheGateway = new CacheGatewayImpl();
const cache = new CacheImpl(cacheGateway);
const db = new PostgresDbImpl(pool);
export const storage = new StorageGatewayImpl(cache, db);

export const uniqueIdGen = new CryptographyUtilitiesImpl(
    new RandomGeneratorImpl()
);
