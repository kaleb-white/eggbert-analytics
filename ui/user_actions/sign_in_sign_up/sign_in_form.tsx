"use client"
import { UserServerActionError, UserServerActionResult } from "@/core/gateways/interfaces/external/users_server_actions";
import { Container } from "../../container";
import { Check } from "../../icons/icons";
import { signInFaviconSize, signInFaviconHex, signInFaviconHexHover } from "../../magic_constants";
import { FormErrors } from "../form_errors";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { z } from "zod/v4-mini"
import { signIn } from "@/client_injections";
import { FormSuccess } from "../form_success";

export function SignInForm() {
    const [errors, setErrors] = useState<UserServerActionResult>({succesful: true})

    // Show errors controls
    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    function setInput(e: ChangeEvent<HTMLInputElement>, setter: Dispatch<SetStateAction<string>>) {
        setter(e.target.value)
    }

    const [prevEmailInput, setPrevEmailInput] = useState("")
    const [prevPasswordInput, setPrevPasswordInput] = useState("")

    function shouldHide(prev: string, current: string) {
        return !(current.length === 0 || current === prev)
    }
    const [hidePasswordErrors, setHidePasswordErrors] = useState(shouldHide(prevPasswordInput, passwordInput))
    const [hideEmailErrors, setHideEmailErrors] = useState(shouldHide(prevEmailInput, emailInput))
    const [hideOtherErrors, setHideOtherErrors] = useState(!(passwordInput.length +  emailInput.length === 0 || (passwordInput === prevPasswordInput && emailInput=== prevEmailInput)))
    useEffect(() => {
        setHideEmailErrors(shouldHide(prevEmailInput, emailInput))
        setHidePasswordErrors(shouldHide(prevPasswordInput, passwordInput))
        setHideOtherErrors(!(passwordInput.length + emailInput.length === 0 || (passwordInput === prevPasswordInput && emailInput=== prevEmailInput)))
    }, [prevEmailInput, emailInput, prevPasswordInput, passwordInput])

    // Sign in success
    const [success, setSuccess] = useState(false)

    const zodEmail = z.email("Please provide a valid email")
    const zodPassword = z.string()

    async function handleSignInForm(formData: FormData) {
        // Reset success and errors
        setSuccess(false)
        setErrors({succesful: false, errorCount: 0})

        const parseEmailResult = zodEmail.safeParse(formData.get("email"))
        const parsePasswordResult = zodPassword.safeParse(formData.get("password"))

        const newErrorsObject: UserServerActionError = {succesful: false, errorCount: 0}

        // Manual check
        const password = formData.get("password")
        const email = formData.get("email")
        if (!password) {
            newErrorsObject["password"] = [new Error("Please include a password")]
            newErrorsObject.errorCount += 1
        }
        if (!email) {
            newErrorsObject["email"] = [new Error("Please include an email")]
            newErrorsObject.errorCount += 1
        }
        if (newErrorsObject.errorCount > 0) {setErrors(newErrorsObject); return}

        if (password && password.toString().length < 8) {
            newErrorsObject["password"] = [new Error("Password must be greater than 8 characters in length")]
            newErrorsObject.errorCount += 1
        } else if (password && password.toString().length > 256) {
            newErrorsObject["password"] = [new Error("Password must be less than 256 characters in length")]
            newErrorsObject.errorCount += 1
        }

        // Check email
        if (!parsePasswordResult.success) {
            if (!newErrorsObject["password"]) newErrorsObject["password"] = new Array<Error>()
            parsePasswordResult.error.issues.forEach(error => {
                    newErrorsObject.errorCount += 1;
                    (newErrorsObject["password"] as Error[]).push(new Error(error.message))
            })
        }
        // Check password
        if (!parseEmailResult.success) {
            if (!newErrorsObject["email"]) newErrorsObject["email"] = new Array<Error>()
            parseEmailResult.error.issues.forEach(error => {
                newErrorsObject.errorCount += 1;
                (newErrorsObject["email"] as Error[]).push(new Error(error.message))
            })
        }

        // Return if erred
        if (newErrorsObject.errorCount > 0) {
            setErrors(newErrorsObject)
            // Set the prev inputs
            setPrevEmailInput(email!.toString())
            setPrevPasswordInput(password!.toString())
            return
        }

        // Talk to controller
        const signInResult = await signIn((email as Bun.FormDataEntryValue).toString(), (password as Bun.FormDataEntryValue).toString())

        setErrors(signInResult)
        if (signInResult.succesful) setSuccess(true)

        // Set the prev inputs
        setPrevEmailInput(email!.toString())
        setPrevPasswordInput(password!.toString())
    }

    return (
        <form className="p-0 flex flex-col gap-2.5 text-base" onSubmit={(e) => {e.preventDefault(); handleSignInForm(new FormData(e.currentTarget))}}>
            <div className="p-0 flex flex-col gap-1">
                <Container>
                    <input onChange={(e) => {setInput(e, setEmailInput)}} name="email" className="w-full focus:outline-0 focus:border-0" placeholder="Email..."></input>
                </Container>
                <FormErrors result={errors} forName="email" hide={hideEmailErrors}/>
            </div>
            <div className="p-0 flex flex-col gap-1">
                <Container>
                    <input  type="password" onChange={(e) => {setInput(e, setPasswordInput)}} name="password" className="w-full focus:outline-0 focus:border-0" placeholder="Password..."></input>
                </Container>
                <FormErrors result={errors} forName="password" hide={hidePasswordErrors} />
                <FormErrors result={errors} forName="exclude: email, password" hide={hideOtherErrors} />
                <FormSuccess show={success} />
            </div>
            <div className="p-0 flex flex-col gap-1">
                <div className="flex flex-row g-2.5 pr-2">
                    <button type="submit" className="w-fit h-fit m-0 p-0 hover:cursor-pointer">
                        <Check edgeLengthPx={signInFaviconSize} fillHex={signInFaviconHex} fillHexHover={signInFaviconHexHover} />
                    </button>
                </div>
            </div>
        </form>
    )
}
