export const truncateStatements = {
    truncateUsers: `TRUNCATE users RESTART IDENTITY CASCADE;`,
    truncatePasswords: `TRUNCATE passwords RESTART IDENTITY CASCADE;`,
    truncateSessions: `TRUNCATE sessions RESTART IDENTITY CASCADE;`,
    truncateSurveys: `TRUNCATE surveys RESTART IDENTITY CASCADE;`,
    truncateQuestions: `TRUNCATE questions RESTART IDENTITY CASCADE;`,
    truncateQuestionResponses: `TRUNCATE questionResponses RESTART IDENTITY CASCADE;`,
    truncateTurns: `TRUNCATE turns RESTART IDENTITY CASCADE;`,
};
