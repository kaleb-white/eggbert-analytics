"use server"

import { Question } from "@/core/entities/surveys/question"
import { QuestionResponse } from "@/core/entities/surveys/question_response"
import { Turn } from "@/core/entities/surveys/turn"
import { CryptographyUtilitiesImpl } from "@/core/use_cases/auth/cryptography/crypto_utility_creator_impl"
import { RandomGeneratorImpl } from "@/core/use_cases/auth/cryptography/random_buffer_generator_impl"
import { PORT } from "@/model_client_proxy/config"
import { ProxySetupClient } from "@/model_client_proxy/core/entities/proxy_setup_client"
import { ProxySetupServer } from "@/model_client_proxy/core/entities/proxy_setup_server"
import { addNewAllowedConnection } from "@/model_client_proxy/core/gateways/external/add_new_allowed_server"
import { ChatBox } from "@/ui/chat_box/chat_box"
import { CustomError } from "@/ui/error/custom_error"

export default async function ResponsesPage({ params }:{ params: Promise<{response: string}>}) {
    const {response} = await params

    // TODO: replace with db query!
    const question = new Question("", "This is a model prompt!")
    const qr = new QuestionResponse("", question, [new Turn("", "model msg 1", "resp msg 1"), new Turn("", "model msg 2")])

    // Is there a way to inject these dependencies thats not super inconvenient?
    // Create setup to send to proxy
    const idGen = new CryptographyUtilitiesImpl(new RandomGeneratorImpl())
    const connectionId = idGen.createUniqueId()
    const proxySetup: ProxySetupServer = new ProxySetupServer(connectionId, qr.dialogueAsString, qr.uniqueId, question)

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
    const setup = new ProxySetupClient(`localhost:${PORT}`, connectionId)

    return (
        <div className="flex place-content-center w-1/2 h-full border-l-2 border-r-2 border-primary">
            <ChatBox questionResponseStringified={JSON.stringify(qr)} connectionSetupStringified={JSON.stringify(setup)} />
        </div>
    )
}
