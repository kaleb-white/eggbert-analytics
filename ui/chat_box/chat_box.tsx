"use client"

import { ResponseInput } from "../response_input/response_input.tsx";
import { Turn } from "@/core/entities/surveys/turn";
import { ModelMessage } from "../messages/model_message.tsx";
import { RespondentMessage } from "../messages/respondent_message";
import { useEffect, useRef, useState } from "react";
import { ProxySetupClient } from "@/model_client_proxy/core/entities/proxy_setup_client.ts";
import { P } from "@/model_client_proxy/core/gateways/external/proxy_client_gateway_test.ts";
import { reconstructQuestionResponse } from "@/stable_utilities/reconstruct_obj/reconstruct_question_response.ts";

export function ChatBox({questionResponseStringified, connectionSetupStringified}: {questionResponseStringified: string, connectionSetupStringified: string}) {
    // Parsed objects
    const questionResponse = useRef(reconstructQuestionResponse(questionResponseStringified))
    const connectionSetup = useRef(JSON.parse(connectionSetupStringified) as ProxySetupClient)
    const proxyGateway = useRef(new P())

    // Setup
    const [awaitingProxyConnection, setAwaitingProxyConnection] = useState(true)
    const [errorsOnStart, setErrorsOnStart] = useState<Error | null>(null)

    // General
    const [transcript, setTranscript] = useState(questionResponse.current.transcript)
    const [errors, setErrors] = useState<Error[] | null>(null)

    // Incoming model messages related
    const [currentModelMessage, setCurrentModelMessage] = useState("")
    const currentModelFinal = useRef(currentModelMessage)
    const [modelMessageOngoing, setModelMessageOngoing] = useState(false)

    useEffect(() => {
        currentModelFinal.current = currentModelMessage
    }, [currentModelMessage])

    useEffect(() => {
        function handleMessageChunk(modelChunk: string) {
            setCurrentModelMessage(currentModelMessage => currentModelMessage.concat(modelChunk))
        }

        function handleMessageErr(err: string) {
            if (errors) {
                setErrors(
                    errors.concat(new Error(err)))
                }
            else {
                setErrors([new Error(err)])
            }
        }

        function handleMessageFinished() {
            setTranscript(transcript => transcript.concat(new Turn("", currentModelFinal.current)))
            setCurrentModelMessage("")
            setModelMessageOngoing(false)
        }

        const start = proxyGateway.current.start(connectionSetup.current,
            handleMessageChunk,
            handleMessageErr,
            handleMessageFinished
        )

        if (start instanceof Error) {
            setErrorsOnStart(start)
        } else {
            setAwaitingProxyConnection(false)
        }
    }, [])


    async function onSubmit(respondentMessage: string) {
        setModelMessageOngoing(true)
        setTranscript(transcript => transcript.map((t, i) => {
            if (i == transcript.length - 1) {
                t.respondentMessage = respondentMessage
                return t
            }
            return t
        }))
        const checkForError = proxyGateway.current.sendRespondentInput(respondentMessage)
        if (checkForError instanceof Error) {
            setErrors([checkForError])
        }
    }

    if (awaitingProxyConnection) {
        return (
        <div className="flex flex-col items-start justify-center border-l-2 border-r-2 border-primary p-2 w-1/2">
            loading
        </div>
        )
    }

    return (
        <div className="flex flex-col items-start justify-end border-l-2 border-r-2 border-primary pr-2 pl-2 pb-2 w-1/2 h-auto">
            <div className="overflow-y-auto flex flex-col items-start justify-baseline pl-1 pr-1 gap-2 w-full h-full flex-1">
                {transcript.map((turn, i) => {
                    console.log(turn.modelMessageExists)
                    return (
                        <div className="contents w-full max-h-full" key={i}>
                            {turn.modelMessageExists?
                                <div className="w-full flex flex-row justify-start">
                                    <div className="w-11/12">
                                        <ModelMessage text={turn.modelMessage}/>
                                    </div>
                                </div> :
                            <></>}
                            {turn.respondentMessageExists?
                                <div className="w-full flex flex-row justify-end">
                                    <div className="w-11/12">
                                        <RespondentMessage text={turn.respondentMessage} />
                                    </div>
                                </div>
                            : <></> }
                        </div>
                    )
                })}
                {currentModelMessage != ""?
                    <div className="w-full flex flex-row justify-start">
                        <div className="w-11/12">
                            <ModelMessage text={currentModelMessage}/>
                        </div>
                    </div> :
                    <></>
                }
            </div>
            <div className="w-full">
                <ResponseInput onSubmit={onSubmit} enabled={!modelMessageOngoing} />
            </div>
        </div>
    )
}
