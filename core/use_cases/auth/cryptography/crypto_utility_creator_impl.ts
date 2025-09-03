import { CryptographyUtilities } from "@/core/entities/interfaces/crypto_utility_creator";
import { RandomGenerator } from "../interfaces/random_buffer_generator";

export class CryptographyUtilitiesImpl implements CryptographyUtilities {
    private randomBufferGenerator: RandomGenerator;

    constructor(randomGenerator: RandomGenerator) {
        this.randomBufferGenerator = randomGenerator;
    }

    createUniqueId(): string {
        const randomBuffer =
            this.randomBufferGenerator.generateRandomBuffer(16);
        return randomBuffer.toHex();
    }
}
