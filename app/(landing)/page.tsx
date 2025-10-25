"use client"

import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Response } from "@/core/entities/surveys/response";
import { QuestionResponseScroll } from "@/ui/navigation/qr_scroll/qr_scroll";

export default function Home() {
    const qr1 = new QuestionResponse("a", new Question("a", "first"))
    const qr2 = new QuestionResponse("b", new Question("a", "second"))
    const qr3 = new QuestionResponse("c", new Question("a", "third"))
    const qr4 = new QuestionResponse("d", new Question("a", "fourth"))
    const qr5 = new QuestionResponse("e", new Question("a", "fifth"))
    const res = new Response("res", [qr1, qr2, qr3, qr4, qr5])
    return (
        <QuestionResponseScroll response={res} currentId="a" onChange={() => console.log("hello")} />
    );
}
