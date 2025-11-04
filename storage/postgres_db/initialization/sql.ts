export const initializationStatements = {
    dropSurveysResponsesTable: "DROP TABLE surveysResponses;",
    dropSurveysQuestionsTable: "DROP TABLE surveysQuestions;",
    dropSurveysTable: "DROP TABLE surveys;",
    dropResponsesQuestionResponsesTable:
        "DROP TABLE responsesQuestionResponses;",
    dropResponsesTable: "DROP TABLE responses;",
    dropQuestionResponsesTurnsTable: "DROP TABLE questionResponsesTurns;",
    dropQuestionResponsesTable: "DROP TABLE questionResponses;",
    dropQuestionsTable: "DROP TABLE questions;",
    dropTurnsTable: "DROP TABLE turns;",

    createTurnsTable: `
        CREATE TABLE turns(
            uniqueId text PRIMARY KEY,
            modelMessage text,
            respondentMessage text,
            timeCreated timestamp NOT NULL DEFAULT current_timestamp,
            lastEdited timestamp NOT NULL
        );
        `,

    createQuestionsTable:
        "\
        CREATE TABLE questions( \
            uniqueId text PRIMARY KEY, \
            question text NOT NULL, \
            modelPrompt text NOT NULL, \
            timeCreated timestamp NOT NULL DEFAULT current_timestamp, \
            lastEdited timestamp NOT NULL, \
            maxNumberOfTurns integer DEFAULT 0 \
        ); \
        ",

    createQuestionResponsesTable:
        "\
        CREATE TABLE questionResponses( \
            uniqueId text PRIMARY KEY, \
            summary text, \
            currentTurn integer DEFAULT 0, \
            timeCreated timestamp NOT NULL DEFAULT current_timestamp, \
            lastEdited timestamp NOT NULL, \
            question text REFERENCES questions (uniqueId) \
        ); \
        ",

    createQuestionResponsesTurnsTable:
        " \
        CREATE TABLE questionResponsesTurns( \
            turnId text REFERENCES turns (uniqueId), \
            questionResponseId text REFERENCES questionResponses (uniqueId) ON DELETE CASCADE, \
            UNIQUE(turnId, questionResponseId) \
        ); \
        ",

    createResponsesTable:
        " \
        CREATE TABLE responses( \
            uniqueId text PRIMARY KEY, \
            timeCreated timestamp NOT NULL DEFAULT current_timestamp, \
            lastEdited timestamp NOT NULL \
        ); \
        ",

    createResponsesQuestionResponsesTable:
        " \
        CREATE TABLE responsesQuestionResponses( \
            questionResponseId text REFERENCES questionResponses (uniqueId), \
            responseId text REFERENCES responses (uniqueId) ON DELETE CASCADE, \
            UNIQUE(questionResponseId, responseId) \
        ); \
        ",

    createSurveysTable:
        "\
        CREATE TABLE surveys(\
            uniqueId text PRIMARY KEY, \
            timeCreated timestamp NOT NULL DEFAULT current_timestamp, \
            lastEdited timestamp NOT NULL \
        );\
        ",

    createSurveysQuestionsTable:
        " \
        CREATE TABLE surveysQuestions(\
            questionId text REFERENCES questions (uniqueId), \
            surveyId text REFERENCES surveys (uniqueId), \
            UNIQUE(questionId, surveyId) \
        ); \
        ",

    createSurveysResponsesTable:
        " \
        CREATE TABLE surveysResponses(\
            responseId text REFERENCES responses (uniqueId), \
            surveyId text REFERENCES surveys (uniqueId) ON DELETE CASCADE, \
            UNIQUE(responseId, surveyId) \
        ); \
        ",
};
