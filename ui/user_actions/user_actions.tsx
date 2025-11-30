import { Container } from "@/ui/container";
import { useState } from "react";
import { SignInForm } from "./sign_in_sign_up/sign_in_form";
import { SignUpForm } from "./sign_in_sign_up/sign_up_form";

type UserActions = "signUp" | "signIn"
export function UserActions({formOnOpen}: {formOnOpen: UserActions}) {
    const userActions: UserActions[] = ["signUp", "signIn"]
    const [selectedForm, setSelectedForm] = useState<UserActions>(formOnOpen)
    return (
        <Container>
            <div className="flex flex-col gap-2.5 text-xl">
                <div className="flex flex-row gap-2.5">
                {userActions.map((action, i) => {
                    const styles = `hover:text-tertiary cursor-pointer border-b-2 ${action === selectedForm ? "border-tertiary" : "border-primary"}`
                    return (
                        <div key={i} className={styles} onClick={() => {setSelectedForm(action)}}>
                            {action === "signIn" ? "Sign In" : "Sign Up"}
                        </div>
                    )
                })}
                </div>
                {selectedForm === "signIn"? <SignInForm /> : <SignUpForm />}

            </div>
        </Container>
    )
}
