"use client"
import { UserActions } from "@/ui/user_actions/user_actions";
import { Logo } from "../../icons/logo";
import { useRef, useState } from "react";
import useClickOutsideToClose from "@/ui/hooks/use_click_outside_to_close";
import { Button } from "@/ui/button";
import { Anonymous, Author, Enter, Exit, NoUser, Respondent } from "@/ui/icons/icons";
import useCheckSession from "@/ui/hooks/use_check_session";
import { Session } from "@/core/entities/users/session";

export function Navbar() {
    // User actions
    const [userActionsOpen, setUserActionsOpen] = useState(false)
    const [userActionsFormOnOpen, setUserActionsFormOnOpen] = useState<UserActions>("signIn")
    const userActionsRef = useRef<HTMLDivElement | null>(null)
    useClickOutsideToClose({insideRef: userActionsRef, setState: setUserActionsOpen, state: userActionsOpen})

    // User role
    const [session, setSession] = useState<Session | null>(null)
    useCheckSession({setSession: setSession})

    return (
        // Changing height will fuck with chatbox as together they must have a max height = 100% of parent
        <>
            <div hidden={!userActionsOpen} className="absolute top-0 left-0 w-screen h-screen bg-primary-overlay z-50">
                <div className="w-full h-full flex flex-row justify-center items-center">
                    <div ref={userActionsRef}>
                        <UserActions formOnOpen={userActionsFormOnOpen}/>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-row justify-start items-center border-secondary border-b-4 min-h-1/12">
                <Logo width={120} />
                <div className="w-full h-full flex flex-row gap-2.5 justify-end items-center mr-2">
                    <Button tooltip="Sign Out">
                        <Exit edgeLengthPx={18} />
                    </Button>
                    <Button tooltip="Sign In" onClick={async () => {setUserActionsFormOnOpen("signIn"); setUserActionsOpen(true)}}>
                        <Enter edgeLengthPx={18} />
                    </Button>
                    <div aria-label={session? session.role : "None"} title={"User role: ".concat(session? session.role : "None")}>
                    {
                    session ? ( session.role === "respondent" ? <Respondent edgeLengthPx={24} /> :
                    session.role === "anonymous" ? <Anonymous edgeLengthPx={24}/> :
                    <Author edgeLengthPx={24}/>) :
                    <NoUser edgeLengthPx={24} />
                    }
                    </div>
                </div>
            </div>
        </>
    )
}
