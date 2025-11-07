import type { Response } from "../../../../../core/entities/surveys/response";

export type SaveResponse = {
    response: Response;
};

export type responseSaver = (r: Response) => Promise<null | Error>;
