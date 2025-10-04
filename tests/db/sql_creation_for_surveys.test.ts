import { Survey } from "@/core/entities/surveys/survey";
import { Author } from "@/core/entities/users/author";
import { describe, expect, test } from "bun:test";
import {
    repeatArrayNTimes,
    truncateAllAndStringify,
} from "../testing_utilities";
import { surveySqlGenerator } from "@/persistent_storage/postgres_db/survey_sql_generator";
import { Question } from "@/core/entities/surveys/question";
import { Response } from "@/core/entities/surveys/response";
import { PossibleStatementFormat } from "@/persistent_storage/postgres_db/generation_types_and_utilities";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Turn } from "@/core/entities/surveys/turn";

describe("test survey sql creation", () => {
    test("test survey with no data sql mapper spits out correct sql", () => {
        const minimalSurvey = new Survey([], "survey", [], new Author(""));

        const minimalExpectedOutput = truncateAllAndStringify([
            [
                "pass",
                "pass",
                "pass",
                "pass",
                `INSERT INTO surveys (uniqueId, timeCreated, lastEdited)
            VALUES (${minimalSurvey.uniqueId}, ${minimalSurvey.timeCreated}, ${minimalSurvey.lastEdited})
            ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;`,
            ],
            ["pass", "pass", "pass", "pass"],
        ]);
        expect(
            truncateAllAndStringify(
                surveySqlGenerator.saveOrUpdateSurvey(minimalSurvey)
            )
        ).toBe(minimalExpectedOutput);
    });

    test("test survey with some data sql mapper spits out correct sql", () => {
        const oneQuestion = new Question("child");

        const expectedQuestionSql: PossibleStatementFormat = {
            isParameterizedStatement: true,
            sql: `
        INSERT INTO questions (uniqueId, modelPrompt, maxNumberOfTurns, timeCreated, lastEdited)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (uniqueId) DO NOTHING;`,
            userInput: [
                oneQuestion.uniqueId,
                oneQuestion.modelPrompt,
                String(oneQuestion.maxNumberOfTurns),
                String(oneQuestion.timeCreated),
                String(oneQuestion.lastEdited),
            ],
        };

        const oneResponse = new Response("child");

        const expectedResponseSql: PossibleStatementFormat = `
        INSERT INTO responses (uniqueId, timeCreated, lastEdited)
            VALUES (${oneResponse.uniqueId}, ${oneResponse.timeCreated}, ${oneResponse.lastEdited})
            ON CONFLICT (uniqueId) DO SET lastEdited = EXCLUDED.lastEdited;
    `;

        const someData = new Survey(
            [oneQuestion],
            "parent",
            [oneResponse],
            new Author("")
        );
        const someExpectedOutput = truncateAllAndStringify([
            [
                "pass",
                expectedQuestionSql,
                "pass",
                expectedResponseSql,
                `INSERT INTO surveys (uniqueId, timeCreated, lastEdited)
            VALUES (${someData.uniqueId}, ${someData.timeCreated}, ${someData.lastEdited})
            ON CONFLICT (uniqueId) DO UPDATE SET lastEdited = EXCLUDED.lastEdited;`,
            ],
            [
                "pass",
                "pass",
                `
            INSERT INTO surveysQuestions (surveyId, questionId)
                VALUES (${someData.uniqueId}, ${oneQuestion.uniqueId})
                ON CONFLICT (surveyId, questionId) DO NOTHING;`,
                `
            INSERT INTO surveysResponses (surveyId, responseId)
                VALUES (${someData.uniqueId}, ${oneResponse.uniqueId})
                ON CONFLICT (surveyId, responseId) DO NOTHING;`,
            ],
        ]);

        const result = surveySqlGenerator.saveOrUpdateSurvey(someData);
        expect(truncateAllAndStringify(result)).toBe(someExpectedOutput);
    });

    test("test survey with nested data sql generation", () => {
        const q1 = new Question("q1");
        const q2 = new Question("q2");

        const r1 = new Response("r1");
        const r2 = new Response("r2");

        const qr1 = new QuestionResponse("qr1", q1);
        const qr2 = new QuestionResponse("qr2", q2);

        const t1 = new Turn("t1", "model said", "user answered");
        const t2 = new Turn("t2", "model said", "user answered");

        qr1.addTurn(t1);
        qr1.addTurn(t2);
        qr2.addTurn(t1);
        qr2.addTurn(t2);

        r1.questionResponses.push(qr1);
        r1.questionResponses.push(qr2);

        r2.questionResponses.push(qr1);
        r2.questionResponses.push(qr2);

        const fullSurvey = new Survey(
            [q1, q2],
            "parent",
            [r1, r2],
            new Author("")
        );

        const fullExpectedOutput = [
            [
                {
                    isParameterizedStatement: true,
                    sql: `INSERT INTO turns (uniqueId, modelAnswer, respondentInput, timeCreated, lastEdited)
                        VALUES ($1, $2, $3, $4, $5) , ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15), ($16, $17, $18, $19, $20), ($21, $22, $23, $24, $25), ($26, $27, $28, $29, $30), ($31, $32, $33, $34, $35), ($36, $37, $38, $39, $40)
                        ON CONFLICT (uniqueId) DO SET modelAnswer=EXCLUDED.modelAnswer, respondentInput=EXCLUDED.respondentInput;`,
                    userInput: repeatArrayNTimes<string>(
                        [
                            "t1",
                            "model said",
                            "user answered",
                            String(t1.timeCreated),
                            String(t1.lastEdited),
                            "t2",
                            "model said",
                            "user answered",
                            String(t2.timeCreated),
                            String(t2.lastEdited),
                        ],
                        4
                    ),
                },
                {
                    isParameterizedStatement: true,
                    sql: `INSERT INTO questions (uniqueId, modelPrompt, maxNumberOfTurns, timeCreated, lastEdited)
                        VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)
                        ON CONFLICT (uniqueId) DO NOTHING;`,
                    userInput: [
                        "q1",
                        "",
                        "0",
                        String(q1.timeCreated),
                        String(q1.lastEdited),
                        "q2",
                        "",
                        "0",
                        String(q1.timeCreated),
                        String(q1.lastEdited),
                    ],
                },
                `INSERTINTOquestionResponses(uniqueId, currentTurn, timeCreated, lastEdited, question) VALUES(qr1, 0, ${qr1.timeCreated}, ${qr1.lastEdited}, q1) , (qr2, 0, ${qr2.timeCreated}, ${qr2.lastEdited}, q2) , (qr1, 0, ${qr1.timeCreated}, ${qr1.lastEdited}, q1) , (qr2, 0, ${qr2.timeCreated}, ${qr2.lastEdited}, q2) ONCONFLICT(uniqueId) DOSETlastEdited=EXCLUDED.lastEdited;`,
                `INSERTINTOresponses(uniqueId, timeCreated, lastEdited) VALUES(r1, ${r1.timeCreated}, ${r1.lastEdited}) , (r2, ${r1.timeCreated}, ${r1.lastEdited}) ONCONFLICT(uniqueId) DOSETlastEdited=EXCLUDED.lastEdited;`,
                `INSERTINTOsurveys(uniqueId, timeCreated, lastEdited) VALUES(parent, ${fullSurvey.timeCreated}, ${fullSurvey.lastEdited}) ONCONFLICT(uniqueId) DOUPDATESETlastEdited=EXCLUDED.lastEdited;`,
            ],
            [
                "INSERTINTOquestionResponsesTurns(questionResponseId, turnId) VALUES(qr1, t1), (qr1, t2) ONCONFLICT(questionResponseId, turnId) DONOTHING;INSERTINTOquestionResponsesTurns(questionResponseId, turnId) VALUES(qr2, t1) , (qr2, t2) ONCONFLICT(questionResponseId, turnId) DONOTHING;INSERTINTOquestionResponsesTurns(questionResponseId, turnId) VALUES(qr1, t1) , (qr1, t2) ONCONFLICT(questionResponseId, turnId) DONOTHING;INSERTINTOquestionResponsesTurns(questionResponseId, turnId) VALUES(qr2, t1) , (qr2, t2) ONCONFLICT(questionResponseId, turnId) DONOTHING;",
                "INSERTINTOresponsesQuestionResponses(responseId, questionResponseId) VALUES(r1, qr1), (r1, qr2) ONCONFLICT(responseId, questionResponseId) DONOTHING;INSERTINTOresponsesQuestionResponses(responseId, questionResponseId) VALUES(r2, qr1) , (r2, qr2) ONCONFLICT(responseId, questionResponseId) DONOTHING;",
                "INSERTINTOsurveysQuestions(surveyId, questionId) VALUES(parent, q1), (parent, q2) ONCONFLICT(surveyId, questionId) DONOTHING;",
                "INSERTINTOsurveysResponses(surveyId, responseId) VALUES(parent, r1), (parent, r2) ONCONFLICT(surveyId, responseId) DONOTHING;",
            ],
        ];

        expect(
            truncateAllAndStringify(
                surveySqlGenerator.saveOrUpdateSurvey(fullSurvey)
            )
        ).toBe(truncateAllAndStringify(fullExpectedOutput));
    });
});
