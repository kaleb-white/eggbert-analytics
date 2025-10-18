import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

/**
 * Safely merges tailwind styles
 * https://www.youtube.com/watch?v=re2JFITR7TI
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
