export const initializationStatements = {
    dropSchema: "DROP SCHEMA public CASCADE;",
    createSchema: "CREATE SCHEMA public;",
    grantPrivilegesToPostgres: "GRANT ALL ON SCHEMA public TO postgres;",
    grantPrivilegesToPublic: "GRANT ALL ON SCHEMA public TO public;",

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
            userId text REFERENCES users (uniqueId) UNIQUE,
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

    createSurveysTable: `
        CREATE TABLE surveys(
            uniqueId text PRIMARY KEY,
            timeCreated bigint NOT NULL,
            lastEdited bigint NOT NULL,
            authorId text REFERENCES users (uniqueId) ON DELETE RESTRICT
        );
        `,

    createQuestionsTable: `
        CREATE TABLE questions(
            uniqueId text PRIMARY KEY,
            question text NOT NULL,
            modelPrompt text NOT NULL,
            timeCreated bigint NOT NULL,
            lastEdited bigint NOT NULL,
            maxNumberOfTurns integer DEFAULT 0,
            surveyId text REFERENCES surveys (uniqueId) ON DELETE CASCADE
        );
        `,

    createResponsesTable: `
        CREATE TABLE responses(
            uniqueId text PRIMARY KEY,
            timeCreated bigint NOT NULL,
            lastEdited bigint NOT NULL,
            surveyId text REFERENCES surveys (uniqueId) ON DELETE CASCADE
        );
        `,

    createQuestionResponsesTable: `
        CREATE TABLE questionResponses(
            uniqueId text PRIMARY KEY,
            summary text,
            currentTurn integer DEFAULT 0,
            timeCreated bigint NOT NULL,
            lastEdited bigint NOT NULL,
            question text REFERENCES questions (uniqueId),
            responseId text REFERENCES responses (uniqueId) ON DELETE CASCADE
        );
        `,

    createTurnsTable: `
        CREATE TABLE turns(
            uniqueId text PRIMARY KEY,
            modelMessage text,
            respondentMessage text,
            timeCreated bigint NOT NULL,
            lastEdited bigint NOT NULL,
            questionResponseId text REFERENCES questionResponses (uniqueId) ON DELETE CASCADE
        );
        `,
};
