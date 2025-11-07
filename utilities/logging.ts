function base(str: string, colorCode: number) {
    return `\x1b[${colorCode}m${str}\x1b[0m`;
}

export function redString(str: string) {
    return base(str, 31);
}

export function greenString(str: string) {
    return base(str, 32);
}

export function yellowString(str: string) {
    return base(str, 33);
}

export function blueString(str: string) {
    return base(str, 34);
}

export function magentaString(str: string) {
    return base(str, 35);
}
