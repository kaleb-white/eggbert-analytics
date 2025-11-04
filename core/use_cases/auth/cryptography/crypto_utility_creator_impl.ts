import { CryptographyUtilities } from "@entities/interfaces/crypto_utility_creator";
import { RandomGenerator } from "../interfaces/random_buffer_generator";

function buf2hex(buffer: Buffer<ArrayBufferLike>) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
}

export class CryptographyUtilitiesImpl implements CryptographyUtilities {
    private randomBufferGenerator: RandomGenerator;

    constructor(randomGenerator: RandomGenerator) {
        this.randomBufferGenerator = randomGenerator;
    }

    createUniqueId(): string {
        const randomBuffer =
            this.randomBufferGenerator.generateRandomBuffer(64);
        return buf2hex(randomBuffer);
    }
}
