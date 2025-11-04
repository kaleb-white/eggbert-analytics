import type { Response } from "../../../../core/entities/surveys/response";
import { proxy_debug } from "../../../../utilities/verbose_checks";
import { SERVERURL, SERVERPORT, saveResponseRouteName } from "../../../config";
import type {
    responseSaver,
    SaveResponse,
} from "../interfaces/internal/response_saver";

const space8 = "         ";
const space10 = space8 + "  ";

export const responseSaverImpl: responseSaver = async (response: Response) => {
    if (proxy_debug()) {
        console.log(space8 + "Attempting save...");
    }
    if (!process.env.EXPECTED_SERVER_TOKEN)
        throw new Error(
            "No server token found. There must be a matching server token shared between the proxy and the server."
        );

    const body: SaveResponse = {
        response: response,
    };

    let fetchResult;
    try {
        fetchResult = await fetch(
            `http://${SERVERURL}:${SERVERPORT}/${saveResponseRouteName}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: process.env.EXPECTED_SERVER_TOKEN,
                },
                body: JSON.stringify(body),
            }
        );
    } catch (err) {
        if (proxy_debug()) {
            console.log(space10 + `Save failed with error: ${err}`);
        }
        fetchResult = new Error(err as string);
    }

    if (fetchResult instanceof Error) {
        if (proxy_debug()) {
            console.log(space10 + `Save failed with error: ${fetchResult}`);
        }
        return fetchResult;
    }

    if (!fetchResult.ok) {
        if (proxy_debug()) {
            console.log(
                space10 + `Save failed with error: ${fetchResult.statusText}`
            );
        }
        return new Error(
            `Error code ${fetchResult.status} while trying to save questionResponse: message was ${fetchResult.statusText}`
        );
    }

    if (proxy_debug()) {
        console.log(space10 + `Save success!`);
    }

    return null;
};
