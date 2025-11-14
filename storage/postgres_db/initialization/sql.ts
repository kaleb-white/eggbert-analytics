export const initializationStatements = {
    dropUsersTable: "DROP TABLE users CASCADE;",
    dropPasswordsTable: "DROP TABLE passwords CASCADE;",
    dropSessionsTable: "DROP TABLE sessions CASCADE;",
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
    dropRolesType: "DROP TYPE IF EXISTS roles;",

    createRolesType:
        "CREATE TYPE roles AS ENUM ('anonymous', 'respondent', 'author');",

    createUsersTable: `
        CREATE TABLE users(
            uniqueId text PRIMARY KEY,
            role roles NOT NULL,
            email text UNIQUE,
            timeCreated bigint NOT NULL,
            lastLogin bigint NOT NULL
        );
    `,

    createPasswordsTable: `
        CREATE TABLE passwords(
            id BIGSERIAL,
            userId text REFERENCES users (uniqueId),
            salt text NOT NULL,
            hash text NOT NULL
        );
    `,

    createSessionsTable: `
        CREATE TABLE sessions(
            uniqueId text PRIMARY KEY,
            antiCsrfToken text NOT NULL,
            userId text REFERENCES users (uniqueId),
            role roles NOT NULL,
            expiration bigint NOT NULL
        );
    `,

    createTurnsTable: `
        CREATE TABLE turns(
            uniqueId text PRIMARY KEY,
            modelMessage text,
            respondentMessage text,
            timeCreated bigint NOT NULL,
            lastEdited bigint NOT NULL
        );
        `,

    createQuestionsTable:
        "\
        CREATE TABLE questions( \
            uniqueId text PRIMARY KEY, \
            question text NOT NULL, \
            modelPrompt text NOT NULL, \
            timeCreated bigint NOT NULL, \
            lastEdited bigint NOT NULL, \
            maxNumberOfTurns integer DEFAULT 0 \
        ); \
        ",

    createQuestionResponsesTable:
        "\
        CREATE TABLE questionResponses( \
            uniqueId text PRIMARY KEY, \
            summary text, \
            currentTurn integer DEFAULT 0, \
            timeCreated bigint NOT NULL, \
            lastEdited bigint NOT NULL, \
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
            timeCreated bigint NOT NULL, \
            lastEdited bigint NOT NULL \
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
            timeCreated bigint NOT NULL, \
            lastEdited bigint NOT NULL, \
            authorId text REFERENCES users (uniqueId) ON DELETE RESTRICT \
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
