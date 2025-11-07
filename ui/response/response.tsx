"use client"
import { ChatBox } from "../chat_box/chat_box";
import { ProxySetupForClient } from "@/model_client_proxy/core/entities/proxy_setup_for_client";
import { useEffect, useRef, useState } from "react";
import { reconstructResponse } from "@/utilities/reconstruct_obj/reconstruct_response";
import { QuestionResponseScroll } from "../navigation/qr_scroll/qr_scroll";
import { Turn } from "@/core/entities/surveys/turn";

export function ResponseBox({ responseStringified, connectionSetupStringified }:{ responseStringified: string, connectionSetupStringified: string }) {
    // Parse objects
    const [response, setResponse] = useState(reconstructResponse(responseStringified))
    const connectionSetup = useRef(JSON.parse(connectionSetupStringified) as ProxySetupForClient)

    // Qr controls
    const [currentQrId, setCurrentId] = useState(response.questionResponses[0].uniqueId)
    const [currentQr, setCurrentQr] = useState(response.questionResponses.filter(qr => qr.uniqueId === currentQrId)[0])
    useEffect(() => {
        setCurrentQr(response.questionResponses.filter(qr => qr.uniqueId === currentQrId)[0])
    }, [currentQrId, response.questionResponses])


    // Callback for scroller
    const onSelctNewQr = (newCurrentId: string) => {
        setCurrentId(newCurrentId)
    }

    // Callback for chatbox
    const onChangeToQr = (qrId: string, newTranscript: Turn[]) => {
        setResponse(response => {
            response.questionResponses = response.questionResponses.map(qr => {
                if (qr.uniqueId == qrId) {
                    qr.transcript = newTranscript
                    qr.lastEdited = Date.now()
                    return qr
                }
                return qr
            })
            return response
        })
    }

    return (
        <div className="flex flex-row w-full h-full items-end justify-center">
            <div className="flex place-content-center w-1/2 h-full border-l-2 border-r-2 border-primary">
                <ChatBox questionResponse={currentQr} connectionSetup={connectionSetup.current} onQrChanged={onChangeToQr}/>
            </div>
            <QuestionResponseScroll currentId={currentQrId} response={response} onChange={onSelctNewQr} />
        </div>
    )
}
