import { describe, expect, test } from "bun:test";
import {
    message_to_protocol_format,
    protocol_format_to_message,
} from "./utilities";

const STX: string = "\u0002";
const ETX: string = "\u0003";
const EOT: string = "\u0004";
const ETB: string = "\u0017";

describe("test utilities for cache gateway", () => {
    describe("test message_to_protocol_format", () => {
        test("correct output with empty string input", () => {
            expect(message_to_protocol_format("")).toBe(
                STX.concat("0000000000").concat("").concat(ETX)
            );
        });

        test("correct output with single char string input", () => {
            expect(message_to_protocol_format("a")).toBe(
                STX.concat("0000000001").concat("a").concat(ETX)
            );
        });

        test("correct output with 10 char string input", () => {
            const str = "abcdefghin";
            expect(message_to_protocol_format(str)).toBe(
                STX.concat("0000000010").concat(str).concat(ETX)
            );
        });

        test("changes end byte when told to change to ETB", () => {
            const str = "abcdefghin";
            expect(message_to_protocol_format(str, false, true)).toBe(
                STX.concat("0000000010").concat(str).concat(ETB)
            );
        });

        test("changes end byte when told to change to EOT", () => {
            const str = "abcdefghin";
            expect(message_to_protocol_format(str, true, false)).toBe(
                STX.concat("0000000010").concat(str).concat(EOT)
            );
        });
    });

    describe("test protocol format to message", () => {
        test("basic test for 3 letter output", () => {
            const input = STX.concat("0000000003").concat("abc").concat(ETX);
            expect(protocol_format_to_message(input)).toBe("abc");
        });

        test("encode and decode to cache protocol do not modify input", () => {
            const my_message = "abcdefh";
            expect(
                protocol_format_to_message(
                    message_to_protocol_format(my_message)
                )
            ).toBe(my_message);
        });
    });
});
