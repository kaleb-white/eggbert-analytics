"use client";
import { Session } from "@/core/entities/users/session";
import { Dispatch, SetStateAction, useEffect } from "react";
import Cookies from "js-cookie";
import { reconstructSession } from "@/utilities/reconstruct_obj/reconstruct_session";

export default function useCheckSession({
    setSession,
}: {
    setSession: Dispatch<SetStateAction<Session | null>>;
}) {
    function listener() {
        const sessionCookie = Cookies.get("session");
        if (!sessionCookie) {
            setSession(null);
            return;
        }
        const session = reconstructSession(sessionCookie);
        setSession(session);
    }
    useEffect(() => {
        listener();
        cookieStore.addEventListener("change", listener);
    }, []);
}
