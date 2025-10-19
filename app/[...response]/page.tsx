"use server"

import { Question } from "@/core/entities/surveys/question"
import { QuestionResponse } from "@/core/entities/surveys/question_response"
import { Turn } from "@/core/entities/surveys/turn"
import { ProxySetupClient } from "@/model_client_proxy/core/entities/proxy_setup_client"
import { ChatBox } from "@/ui/chat_box/chat_box"

export default async function ResponsesPage({params}:{params: Promise<{response: string}>}) {
    const {response} = await params
    const qr = new QuestionResponse("", new Question(""), [new Turn("", "model msg 1", "resp msg 1"), new Turn("", "model msg 2", "resp msg 2")])
    const setup = new ProxySetupClient("", "")

    return (
        <div className="flex place-content-center w-full h-full">
            <ChatBox questionResponseStringified={JSON.stringify(qr)} connectionSetupStringified={JSON.stringify(setup)} />
        </div>
    )
}
