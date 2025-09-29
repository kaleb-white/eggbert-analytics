import type { Request, Response } from "express";
import { ConnectionSetup } from "../entities/connection_setup";
import { checkRawServerToken } from "./auth";

const space4 = "    ";
const space6 = "      ";

function checkRequestFields(foundRequestFields: string[]): string[] {
    const expectedRequestFields = Object.getOwnPropertyNames(
        new ConnectionSetup()
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
    res: Response,
    DEV: boolean = false
): ConnectionSetup | null {
    // Check that a body was sent, it includes a "serverToken" field, and that the serverToken is correct
    if (
        !Object.keys(req).includes("body") ||
        !Object.keys(req.body).includes("serverToken") ||
        !checkRawServerToken(req.body.serverToken)
    ) {
        res.status(401).statusMessage = "Access denied";
        if (DEV) {
            console.log(
                space6,
                "Failed with status message:",
                res.statusMessage
            );
        }
        return null;
    }

    // Check conection setup field
    console.log(space6, req.body);
    if (!Object.keys(req.body).includes("connectionSetup")) {
        res.status(400).statusMessage = "Missing connectionSetup object";
        if (DEV) {
            console.log(
                space6,
                "Failed with status message:",
                res.statusMessage
            );
        }
        return null;
    }

    const foundRequestFields = Object.keys(req.body.connectionSetup);
    const fieldsMissingFromRequest = checkRequestFields(foundRequestFields);

    if (fieldsMissingFromRequest.length > 0) {
        res.status(400).statusMessage =
            "A server request was missing these fields during setup: " +
            fieldsMissingFromRequest.join(", ");
        if (DEV) {
            console.log(
                space6,
                "Failed with status message:",
                res.statusMessage
            );
        }
        return null;
    }

    const setupArguments: ConnectionSetup = req.body
        .connectionSetup as ConnectionSetup;

    return setupArguments;
}

export function setupProxy(
    req: Request,
    res: Response,
    idToConnection: Map<string, ConnectionSetup>,
    approvedPeerAddresses: string[],
    DEV: boolean = false
) {
    if (DEV) {
        console.log(space4, "Extracting arguments from request body...");
    }
    const setupArguments = extractSetupArgumentsFromRequestBody(req, res, DEV);
    if (!setupArguments) {
        return;
    }

    if (DEV) {
        console.log(
            space4,
            "Success! Saving connection information and returning 200..."
        );
    }
    idToConnection.set(setupArguments.connectionId, setupArguments);
    approvedPeerAddresses.push(setupArguments.peerAddress);
    res.status(200);
    res.send("OK");
}
