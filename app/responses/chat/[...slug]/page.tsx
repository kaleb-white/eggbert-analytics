"use server"

import { ResponseError } from "@/app/errors/_entities"
import { Response } from "@/core/entities/surveys/response"
import { storage, uniqueIdGen } from "@/injections"
import { PORT } from "@/model_client_proxy/config"
import { ProxySetupForClient } from "@/model_client_proxy/core/entities/proxy_setup_for_client"
import { ProxySetupForServer } from "@/model_client_proxy/core/entities/proxy_setup_for_server"
import { addNewAllowedConnection } from "@/model_client_proxy/core/gateways/external/add_new_allowed_server"
import { CustomError } from "@/ui/error/custom_error"
import { ResponseBox } from "@/ui/response/container/response"
import { encodeErrorToUri } from "@/utilities/encode_error_uri"
import { redirect } from "next/navigation"

export default async function ResponsesPage({ params }:{ params: Promise<{slug: string}>}) {
    const {slug} = await params

    // Retrieve question response from db
    const res = await storage.get<Response>(slug[0], new Response())
    if (!res || res instanceof Error) {
        const error: ResponseError = {msg: `No response found with id ${slug[0]}`}
        redirect(`errors/response${encodeErrorToUri(error)}`)
    }

    const connectionId = uniqueIdGen.createUniqueId()
    const proxySetup: ProxySetupForServer = new ProxySetupForServer(connectionId, "", res)

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
       <ResponseBox responseStringified={JSON.stringify(res)} connectionSetupStringified={JSON.stringify(setup)}/>
    )
}
