export const statements = {
    dropSurveysResponsesTable: "DROP TABLE surveysResponses;",
    dropSurveysQuestionsTable: "DROP TABLE surveysQuestions;",
    dropSurveysTable: "DROP TABLE surveys;",
    dropResponsesQuestionResponsesTable:
        "DROP TABLE responsesQuestionResponses;",
    dropResponsesTable: "DROP TABLE responses;",
    dropQuestionResponsesTurnsTable: "DROP TABLE questionResponsesTurns;",
    dropQuestionResponsesTable: "DROP TABLE questionResponses;",
    dropQuestionsTable: "DROP TABLE questions;",
    dropTurnsTable: "DROP TABLE TURNS;",

    createTurnsTable:
        " \
        CREATE TABLE turns( \
            uniqueId text PRIMARY KEY, \
            modelAnswer text, \
            respondentInput text \
        ); \
        ",

    createQuestionsTable:
        "\
        CREATE TABLE questions( \
            uniqueId text PRIMARY KEY, \
            modelPrompt text NOT NULL, \
            maxNumberOfTurns integer DEFAULT 0 \
        ); \
        ",

    createQuestionResponsesTable:
        "\
        CREATE TABLE questionResponses( \
            uniqueId text PRIMARY KEY, \
            currentTurn integer DEFAULT 0, \
            timeCreated timestamp NOT NULL DEFAULT current_timestamp, \
            lastEdited timestamp NOT NULL, \
            question text REFERENCES questions \
        ); \
        ",

    createQuestionResponsesTurnsTable:
        " \
        CREATE TABLE questionResponsesTurns( \
            turnId text REFERENCES turns, \
            questionResponseId text REFERENCES questionResponses ON DELETE CASCADE, \
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
            questionId text REFERENCES questions, \
            surveyId text REFERENCES surveys, \
            UNIQUE(questionId, surveyId) \
        ); \
        ",

    createSurveysResponsesTable:
        " \
        CREATE TABLE surveysResponses(\
            responseId text REFERENCES responses, \
            surveyId text REFERENCES surveys ON DELETE CASCADE, \
            UNIQUE(responseId, surveyId) \
        ); \
        ",
};
