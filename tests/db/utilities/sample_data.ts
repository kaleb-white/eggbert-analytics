import { Question } from "@/core/entities/surveys/question";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Survey } from "@/core/entities/surveys/survey";
import { Turn } from "@/core/entities/surveys/turn";
import { Response } from "@/core/entities/surveys/response";
import { Author } from "@/core/entities/users/author";

const q1: Question = new Question({
    uniqueId: "q1",
    question: "first question",
    surveyId: "sampleSurvey",
});
const q2: Question = new Question({
    uniqueId: "q2",
    question: "question",
    surveyId: "sampleSurvey",
});

const q1t1: Turn = new Turn({
    uniqueId: "q1t1",
    modelMessage: "first model response",
    respondentMessage: "first user answer",
    questionResponseId: "qr1",
});
const q1t2: Turn = new Turn({
    uniqueId: "q1t2",
    modelMessage: "second model response",
    respondentMessage: "second user answer",
    questionResponseId: "qr1",
});
const q2t1: Turn = new Turn({
    uniqueId: "q2t1",
    modelMessage: "first model response",
    respondentMessage: "first user answer",
    questionResponseId: "qr2",
});
const q2t2: Turn = new Turn({
    uniqueId: "q2t2",
    modelMessage: "second model response",
    respondentMessage: "second user answer",
    questionResponseId: "qr2",
});
const q3t1: Turn = new Turn({
    uniqueId: "q3t1",
    modelMessage: "first model response",
    respondentMessage: "first user answer",
    questionResponseId: "qr3",
});
const q3t2: Turn = new Turn({
    uniqueId: "q3t2",
    modelMessage: "second model response",
    respondentMessage: "second user answer",
    questionResponseId: "qr3",
});
const q4t1: Turn = new Turn({
    uniqueId: "q4t1",
    modelMessage: "first model response",
    respondentMessage: "first user answer",
    questionResponseId: "qr4",
});
const q4t2: Turn = new Turn({
    uniqueId: "q4t2",
    modelMessage: "second model response",
    respondentMessage: "second user answer",
    questionResponseId: "qr4",
});

const qr1: QuestionResponse = new QuestionResponse({
    uniqueId: "qr1",
    question: q1,
    transcript: [q1t1, q1t2],
    responseId: "r1",
});
const qr2: QuestionResponse = new QuestionResponse({
    uniqueId: "qr2",
    question: q2,
    transcript: [q2t1, q2t2],
    responseId: "r1",
});
const qr3: QuestionResponse = new QuestionResponse({
    uniqueId: "qr3",
    question: q1,
    transcript: [q3t1, q3t2],
    responseId: "r2",
});
const qr4: QuestionResponse = new QuestionResponse({
    uniqueId: "qr4",
    question: q2,
    transcript: [q4t1, q4t2],
    responseId: "r2",
});

const r1: Response = new Response({
    uniqueId: "r1",
    questionResponses: [qr1, qr2],
    surveyId: "sampleSurvey",
});
const r2: Response = new Response({
    uniqueId: "r2",
    questionResponses: [qr3, qr4],
    surveyId: "sampleSurvey",
});

const author: Author = new Author({ uniqueId: "author" });

export const sampleSurvey: Survey = new Survey({
    uniqueId: "sampleSurvey",
    questions: [q1, q2],
    responses: [r1, r2],
    author: author,
});
