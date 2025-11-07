const STX: string = "\u0002";
const ETX: string = "\u0003";
const EOT: string = "\u0004";
const ETB: string = "\u0017";

const length_of_message_length_int = 10;

export function message_to_protocol_format(
    message: string,
    transmission_end = false,
    stop_cache = false
): string {
    let message_length_bytes: string = String(message.length);
    message_length_bytes = "0"
        .repeat(length_of_message_length_int - message_length_bytes.length)
        .concat(message_length_bytes);

    return STX.concat(message_length_bytes)
        .concat(message)
        .concat(stop_cache ? ETB : transmission_end ? EOT : ETX);
}

export function protocol_format_to_message(cache_response: string): string {
    return cache_response.slice(STX.length + length_of_message_length_int, -1);
}
