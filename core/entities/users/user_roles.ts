import { User } from "./user";

export type Role = "anonymous" | "respondent" | "author";

export type UserNoRole = {
    [Property in keyof User as Exclude<Property, "role">]?: User[Property];
};

export const Roles = ["anonymous", "respondent", "author"];
