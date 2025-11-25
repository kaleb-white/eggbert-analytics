"use client"

import { ResponseInput } from "../response_input/response_input.tsx";
import { Turn } from "@/core/entities/surveys/turn";
import { ModelMessage } from "../messages/model_message.tsx";
import { RespondentMessage } from "../messages/respondent_message";
import { useEffect, useRef, useState } from "react";
import { ProxySetupForClient } from "@/model_client_proxy/core/entities/proxy_setup_for_client.ts";
import { ProxyClientGatewayImpl } from "@/model_client_proxy/core/gateways/external/proxy_client_gateway_impl.ts";
import { Down, Question } from "../../icons/icons.tsx";
import { ThemeColorHex } from "../../types_enums.ts";
import { chatboxQuestionInfoSize, chatboxScrollDownSize } from "../../magic_constants.ts";
import { QuestionResponse } from "@/core/entities/surveys/question_response.ts";

function QuestionBanner({ questionText }:{ questionText: string }) {
    return (
        <div className="flex flex-row gap-2.5 justify-start items-center w-full bg-primary-subtle text-tertiary font-bold p-1">
            <div>
            <Question edgeLengthPx={chatboxQuestionInfoSize} fillHex={ThemeColorHex["tertiary"]} />
            </div>
            <div>{questionText}</div>
        </div>
    )
}

export function ChatBox({questionResponse, connectionSetup, onQrChanged}: {questionResponse: QuestionResponse, connectionSetup: ProxySetupForClient, onQrChanged: (qrId: string, newTranscript: Turn[]) => void}) {
    // Parsed objects
    const proxyGateway = useRef(new ProxyClientGatewayImpl())

    // Setup
    const [awaitingProxyConnection, setAwaitingProxyConnection] = useState(true)
    const [errorsOnStart, setErrorsOnStart] = useState<Error | null>(null)

    // General
    const [transcript, setTranscript] = useState(questionResponse.transcript)
    useEffect(() => {
        setTranscript(questionResponse.transcript)
    }, [questionResponse])
    const [errors, setErrors] = useState<Error[] | null>(null)

    // Incoming model messages related
    const [modelMessageRendering, setModelMessageRendering] = useState("")
    const modelMessageInternal = useRef("")
    const [modelMessageOngoing, setModelMessageOngoing] = useState(false)

    // Change qr transcript in parent on transcript change
    useEffect(() => {
        onQrChanged(questionResponse.uniqueId, transcript)
    }, [onQrChanged, questionResponse.uniqueId, transcript])

    // Element refs
    const chatboxBottomRef = useRef<null | HTMLDivElement>(null)

    useEffect(() => {
        function handleMessageChunk(modelChunk: string) {
            setModelMessageRendering(modelMessageRendering => modelMessageRendering.concat(modelChunk))
            modelMessageInternal.current += modelChunk
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
            /*  For some reason, creating a new Turn object within the setTranscript callback
                sets modelMessage to be "". Creating a new turn within the handleMessageFinished callback works.
                When the callback to setTransript is called modelMessageInternal.current IS "", so good to remember those
                callbacks execute with the initial useState / Ref values.
            */
            const newTurn = new Turn({modelMessage: modelMessageInternal.current})
            setTranscript(transcript =>
                transcript.concat(newTurn)
            )
            setModelMessageRendering("")
            modelMessageInternal.current = ""
            setModelMessageOngoing(false)
        }

        const start = proxyGateway.current.start(connectionSetup,
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

        // Change stored text
        setTranscript(transcript =>
            transcript.map((t, i) => {
            if (i == transcript.length - 1) {
                t.respondentMessage = respondentMessage
                return t
            }
            return t
        })
    )

        // Return proxy errors
        const checkForError = proxyGateway.current.sendRespondentInput(respondentMessage, questionResponse.uniqueId)
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
        <div className="flex flex-col items-start justify-end  pb-2 w-full h-full">
            {/* Question banner */}
            <QuestionBanner questionText={questionResponse.question.question} />
            {/* Chats container */}
            <div className="overflow-y-auto flex flex-col items-start justify-baseline pl-3 pr-3 pt-1 gap-2.5 w-full flex-1 h-full">
                {transcript.map((turn, i) => {
                    return (
                        <div className="contents w-full" key={i}>
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
                {modelMessageRendering != ""?
                    <div className="w-full flex flex-row justify-start">
                        <div className="w-11/12">
                            <ModelMessage text={modelMessageRendering}/>
                        </div>
                    </div> :
                    <></>
                }
                <div ref={chatboxBottomRef}></div>
            </div>
            {/* Input */}
            <div className="relative w-full pl-1 pr-1">
                {/* Scroll to bottom control TODO: magic positions arent great */}
                <div className="absolute -top-8 right-5 border-2 border-secondary-bold rounded-lg cursor-pointer" onClick={() => {if (chatboxBottomRef.current) chatboxBottomRef.current.scrollIntoView({block: "end", inline: "nearest", "behavior": "smooth"})}}>
                    <Down edgeLengthPx={chatboxScrollDownSize} fillHex={ThemeColorHex["secondary-bold"]} />
                </div>
                <ResponseInput onSubmit={onSubmit} enabled={!modelMessageOngoing} />
            </div>
        </div>
    )
}
