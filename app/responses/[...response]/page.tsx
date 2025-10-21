"use server"

import { QuestionResponse } from "@/core/entities/surveys/question_response"
import { storage, uniqueIdGen } from "@/core/injections"
import { PORT } from "@/model_client_proxy/config"
import { ProxySetupForClient } from "@/model_client_proxy/core/entities/proxy_setup_for_client"
import { ProxySetupForServer } from "@/model_client_proxy/core/entities/proxy_setup_for_server"
import { addNewAllowedConnection } from "@/model_client_proxy/core/gateways/external/add_new_allowed_server"
import { ChatBox } from "@/ui/chat_box/chat_box"
import { CustomError } from "@/ui/error/custom_error"

export default async function ResponsesPage({ params }:{ params: Promise<{response: string}>}) {
    const {response} = await params

    // Retrieve question response from db
    const qr = await storage.get<QuestionResponse>(response[0], new QuestionResponse())
    if (!qr || qr instanceof Error) {
        return (
            <CustomError errorMsg={
                qr? qr.message : "Not found"
            } />
        )
    }

    const connectionId = uniqueIdGen.createUniqueId()
    const proxySetup: ProxySetupForServer = new ProxySetupForServer(connectionId, qr.dialogueAsString, qr.uniqueId, qr.question)

    // Send to proxy
    const proxySetupResult = await addNewAllowedConnection(proxySetup)
    if (!(proxySetupResult.status == 200)) {
        return (
            <CustomError errorMsg={
                proxySetupResult instanceof Error ?
                proxySetupResult.message :
                JSON.stringify(proxySetupResult.body)
            } />
        )
    }

    // Create setup to send to client
    // TODO: need to know addr server is running on here? Bc proxy should be running on same server?
    const setup = new ProxySetupForClient(`localhost:${PORT}`, connectionId)

    return (
        <div className="flex place-content-center w-1/2 h-full border-l-2 border-r-2 border-primary">
            <ChatBox questionResponseStringified={JSON.stringify(qr)} connectionSetupStringified={JSON.stringify(setup)} />
        </div>
    )
}
