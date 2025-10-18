"use client"

import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { ResponseInput } from "../response_input/response_input.tsx";
import { Turn } from "@/core/entities/surveys/turn";
import { ModelMessage } from "../messages/model_message.tsx";
import { RespondentMessage } from "../messages/respondent_message";
import { useState, useEffect } from "react";
import { ProxyClientGateway } from "@/model_client_proxy/core/gateways/interfaces/external/proxy_client_gateway.ts";
import { ClientConnectionSetup } from "@/model_client_proxy/core/entities/client_connection_setup.ts";

export function ChatBox({questionResponse, proxyGateway, connectionSetup}: {questionResponse: QuestionResponse, proxyGateway: ProxyClientGateway, connectionSetup: ClientConnectionSetup}) {
    // Setup
    const [awaitingProxyConnection, setAwaitingProxyConnection] = useState(true)
    const [errorsOnStart, setErrorsOnStart] = useState<Error | null>(null)

    // General
    const [transcript, setTranscript] = useState(questionResponse.transcript)
    const [errors, setErrors] = useState<Error[] | null>(null)

    // Incoming model messages related
    const [currentModelMessage, setCurrentModelMessage] = useState("")
    const [modelMessageOngoing, setModelMessageOngoing] = useState(false)

    function handleMessageChunk(modelChunk: string) {
        setCurrentModelMessage(currentModelMessage.concat(modelChunk))
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
        setTranscript(transcript.concat(new Turn("", currentModelMessage)))
        setCurrentModelMessage("")
        setModelMessageOngoing(false)
    }

    const start = proxyGateway.start(connectionSetup,
        handleMessageChunk,
        handleMessageErr,
        handleMessageFinished
    )

    if (start instanceof Error) {
        setErrorsOnStart(start)
    } else {
        setAwaitingProxyConnection(false)
    }

    async function onSubmit(respondentMessage: string) {
        setModelMessageOngoing(true)
        setTranscript(transcript.map((t, i) => {
            if (i == transcript.length - 1) {
                t.respondentMessage = respondentMessage
                return t
            }
            return t
        }))
        const checkForError = proxyGateway.sendRespondentInput(respondentMessage)
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
        <div className="flex flex-col items-start justify-center border-l-2 border-r-2 border-primary p-2 w-1/2">
            <div className="flex flex-col items-start justify-center p-1 gap-1 w-full">
                {transcript.map((turn, i) => {
                    return (
                        <div className="contents w-full" key={i}>
                            {turn.modelMessageExists? <ModelMessage text={turn.modelMessage} /> : <></>}
                            {turn.respondentMessageExists? <RespondentMessage text={turn.respondentMessage} />: <></> }
                        </div>
                    )
                })}
            </div>
            <ResponseInput onSubmit={onSubmit} enabled={!modelMessageOngoing} />
        </div>
    )
}
