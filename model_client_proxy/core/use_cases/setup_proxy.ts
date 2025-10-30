import type { Request, Response } from "express";
import { ProxySetupForServer } from "../entities/proxy_setup_for_server";
import { checkRawServerToken } from "./auth";
import { proxy_debug } from "../../../stable_utilities/verbose_checks";

const space4 = "    ";
const space6 = "      ";
const space8 = "        ";

function checkRequestFields(foundRequestFields: string[]): string[] {
    const expectedRequestFields = Object.getOwnPropertyNames(
        new ProxySetupForServer()
    );

    const fieldsMissingFromRequest: string[] = [];
    expectedRequestFields.forEach((key) => {
        if (!foundRequestFields.includes(key))
            fieldsMissingFromRequest.push(key);
    });
    return fieldsMissingFromRequest;
}

export function extractSetupArgumentsFromRequestBody(
    req: Request,
    res: Response
): ProxySetupForServer | null {
    // Check that a body was sent, it includes a "serverToken" field, and that the serverToken is correct
    if (
        !Object.keys(req).includes("body") ||
        !Object.keys(req.body).includes("serverToken") ||
        !checkRawServerToken(req.body.serverToken)
    ) {
        res.status(401).statusMessage = "Access denied";
        if (proxy_debug()) {
            console.log(
                space6,
                "Failed with status message:",
                res.statusMessage
            );
        }

        if (proxy_debug()) {
            if (!Object.keys(req).includes("body"))
                console.log(space8, "Reason: Request missing body");
            else if (!Object.keys(req.body).includes("serverToken"))
                console.log(space8, "Reason: Request body missing serverToken");
            else if (!checkRawServerToken(req.body.serverToken))
                console.log(
                    space8,
                    "Reason: Incorrect server token:",
                    req.body.serverToken
                );
        }

        return null;
    }

    // Check conection setup field
    if (proxy_debug()) {
        console.log(
            space6,
            "Request body found and includes correct server token"
        );
    }
    if (!Object.keys(req.body).includes("connectionSetup")) {
        res.status(400).statusMessage = "Missing connectionSetup object";
        if (proxy_debug()) {
            console.log(
                space6,
                "Failed with status message:",
                res.statusMessage
            );
        }
        return null;
    }

    const connectionSetup =
        req.body.connectionSetup && typeof req.body.connectionSetup == "object"
            ? req.body.connectionSetup
            : JSON.parse(req.body.connectionSetup);
    const foundRequestFields = Object.keys(connectionSetup);
    const fieldsMissingFromRequest = checkRequestFields(foundRequestFields);

    if (fieldsMissingFromRequest.length > 0) {
        res.status(400).statusMessage =
            "A server request was missing these fields during setup: " +
            fieldsMissingFromRequest.join(", ");
        if (proxy_debug()) {
            console.log(
                space6,
                "Failed with status message:",
                res.statusMessage
            );
        }
        return null;
    }

    return connectionSetup;
}

export function setupProxy(
    req: Request,
    res: Response,
    idToConnection: Map<string, ProxySetupForServer>
) {
    if (proxy_debug()) {
        console.log(space4, "Extracting arguments from request body...");
    }
    const setupArguments = extractSetupArgumentsFromRequestBody(req, res);
    if (!setupArguments) {
        return;
    }

    if (proxy_debug()) {
        console.log(
            space4,
            "Success! Saving connection information and returning 200..."
        );
        console.log(space4, "Saving connectionId", setupArguments.connectionId);
    }
    idToConnection.set(setupArguments.connectionId, setupArguments);
    res.status(200);
    res.send("OK");
}
