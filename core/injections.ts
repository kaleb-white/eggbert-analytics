import { CacheGatewayImpl } from "@/persistent_storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { CacheImpl } from "./gateways/external/cpp_socket_cache_impl";
import testPool from "@/tests/db/utilities/test_pool";
import { PostgresDbImpl } from "./gateways/external/postgres_db_impl";
import { StorageGatewayImpl } from "./gateways/internal/storage_gateway_impl";
import { CryptographyUtilitiesImpl } from "./use_cases/auth/cryptography/crypto_utility_creator_impl";
import { RandomGeneratorImpl } from "./use_cases/auth/cryptography/random_buffer_generator_impl";

const cacheGateway = new CacheGatewayImpl();
const cache = new CacheImpl(cacheGateway);
const db = new PostgresDbImpl(testPool);
export const storage = new StorageGatewayImpl(cache, db);

export const uniqueIdGen = new CryptographyUtilitiesImpl(
    new RandomGeneratorImpl()
);
