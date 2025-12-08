import { CacheGatewayImpl } from "@/storage/cpp_cache/cache_gateway/ts/cache_gateway_impl";
import { CacheImpl } from "./core/gateways/external/cpp_socket_cache_impl";
import { PostgresDbImpl } from "./core/gateways/external/postgres_db_impl";
import { StorageGatewayImpl } from "./core/gateways/internal/storage_gateway_impl";
import { CryptographyUtilitiesImpl } from "./core/controllers/crypto/crypto_utility_creator_impl";
import { Pool } from "pg";
import { RandomGeneratorImpl } from "./core/controllers/crypto/random_buffer_generator_impl";
import { InitializerImpl } from "./storage/postgres_db/initialization/initializer_impl";
import testPool from "./tests/db/utilities/test_pool";
import { UserControllerImpl } from "./core/controllers/user_controller/user_controller_impl";
import { UserController } from "./core/controllers/user_controller/interfaces/user_controller";
import { SessionController } from "./core/controllers/session_controller/interfaces/session_controller";
import { SessionControllerImpl } from "./core/controllers/session_controller/session_controller_impl";

export const pool = new Pool({
    database: process.env.PGTESTDATABASE, // Change to PGDATABASE for prod
    host: process.platform == "win32" ? "localhost" : process.env.PGHOST,
});

const cacheGateway = new CacheGatewayImpl();
const cache = new CacheImpl(cacheGateway);
const db = new PostgresDbImpl(testPool);
export const storage = new StorageGatewayImpl(cache, db);

export const uniqueIdGen = new CryptographyUtilitiesImpl(
    new RandomGeneratorImpl()
);

export const userController: UserController = new UserControllerImpl();
export const sessionController: SessionController = new SessionControllerImpl();

export const testInitializer = new InitializerImpl(testPool);
// export const initializer = new InitializerImpl(pool);
