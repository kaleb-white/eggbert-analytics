"use client"
import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { ChatBox } from "@/ui/chat_box/chat_box";
import { ResponseInput } from "@/ui/response_input/response_input";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <ResponseInput onSubmit={async () => {}}  enabled={true} />
        {children}
    </div>
  );
}
