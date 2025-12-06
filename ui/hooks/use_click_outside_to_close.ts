"use client";
import { Dispatch, RefObject, SetStateAction, useEffect } from "react";

export default function useClickOutsideToClose({
    insideRef,
    state,
    setState,
}: {
    insideRef: RefObject<HTMLDivElement | null>;
    state: boolean;
    setState: Dispatch<SetStateAction<boolean>>;
}): void {
    useEffect(() => {
        const callback = (ev: MouseEvent) => {
            if (!state) return;
            const loc = ev.target as HTMLElement;
            if (!insideRef.current?.contains(loc)) {
                setState(false);
            }
        };
        document.addEventListener("click", callback);
        return () => document.removeEventListener("click", callback);
    }, [insideRef, state, setState]);
}
