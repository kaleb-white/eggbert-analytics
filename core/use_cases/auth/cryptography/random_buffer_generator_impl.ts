import { RandomGenerator } from "../interfaces/random_buffer_generator";

export class RandomGeneratorImpl implements RandomGenerator {
    /**
     * @param length length of the string to return, in bytes.
     * @returns an unpredictable randomly generated string
     */
    generateRandomBuffer(length: number): Buffer {
        return crypto.getRandomValues(Buffer.alloc(length));
    }
}
