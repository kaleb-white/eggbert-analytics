"use client"
import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Turn } from "@/core/entities/surveys/turn";
import { ProxySetupForClient } from "@/model_client_proxy/core/entities/proxy_setup_for_client";
import { P } from "@/model_client_proxy/core/gateways/external/proxy_client_gateway_test";
import { ProxyClientGateway } from "@/model_client_proxy/core/gateways/interfaces/external/proxy_client_gateway";
import { ChatBox } from "@/ui/chat_box/chat_box";
import { Logo } from "@/ui/icons/logo";
import { Navbar } from "@/ui/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const qr = new QuestionResponse("", new Question(""), [new Turn("", "model msg 1", "resp msg 1"), new Turn("", "model msg 2", "resp msg 2")])


  return (
    <div>
        <Navbar />
        {children}
    </div>
  );
}
