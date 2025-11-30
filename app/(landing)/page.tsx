"use client"

import { UserActions } from "@/ui/user_actions/user_actions";


export default function Home() {
    return (
        <div className="m-10">
            <UserActions formOnOpen="signIn"></UserActions>
        </div>
    );
}
