import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Survey } from "@/core/entities/surveys/survey";
import { Turn } from "@/core/entities/surveys/turn";
import { Response } from "@/core/entities/surveys/response";
import { Author } from "@/core/entities/users/author";

const q1: Question = new Question("q1", "first model prompt");
const q2: Question = new Question("q2", "second model prompt");

const q1t1: Turn = new Turn(
    "q1t1",
    "first model response",
    "first user answer"
);
const q1t2: Turn = new Turn(
    "q1t2",
    "second model response",
    "second user answer"
);
const q2t1: Turn = new Turn(
    "q2t1",
    "first model response",
    "first user answer"
);
const q2t2: Turn = new Turn(
    "q2t2",
    "second model response",
    "second user answer"
);
const q3t1: Turn = new Turn(
    "q3t1",
    "first model response",
    "first user answer"
);
const q3t2: Turn = new Turn(
    "q3t2",
    "second model response",
    "second user answer"
);
const q4t1: Turn = new Turn(
    "q4t1",
    "first model response",
    "first user answer"
);
const q4t2: Turn = new Turn(
    "q4t2",
    "second model response",
    "second user answer"
);

const qr1: QuestionResponse = new QuestionResponse("qr1", q1, [q1t1, q1t2]);
const qr2: QuestionResponse = new QuestionResponse("qr2", q2, [q2t1, q2t2]);
const qr3: QuestionResponse = new QuestionResponse("qr3", q1, [q3t1, q3t2]);
const qr4: QuestionResponse = new QuestionResponse("qr4", q2, [q4t1, q4t2]);

const r1: Response = new Response("r1", [qr1, qr2]);
const r2: Response = new Response("r2", [qr3, qr4]);

export const sampleSurvey: Survey = new Survey(
    "sampleSurvey",
    [q1, q2],
    [r1, r2],
    new Author("")
);
