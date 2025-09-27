import type { Request, Response } from "express";
import { ConnectionSetup } from "../entities/connection_setup";
import { checkRawServerToken } from "./auth";
import { DialogueContext } from "../entities/response_context";

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
    res: Response
): ConnectionSetup | null {
    // Check that a body was sent, it includes a "serverToken" field, and that the serverToken is correct
    if (
        !Object.keys(req).includes("body") ||
        !Object.keys(req.body).includes("serverToken") ||
        !checkRawServerToken(req.body.serverToken)
    ) {
        res.status(401).statusMessage = "Access denied";
        return null;
    }

    // Check that all expe
    if (!Object.keys(req.body).includes("connectionSetup")) {
        res.status(400).statusMessage = "Missing connectionSetup object";
        return null;
    }

    const foundRequestFields = Object.keys(req.body.connectionSetup);
    const fieldsMissingFromRequest = checkRequestFields(foundRequestFields);

    if (fieldsMissingFromRequest.length > 0) {
        res.status(400).statusMessage =
            "A server request was missing these fields during setup: " +
            fieldsMissingFromRequest.join(", ");
        return null;
    }

    const setupArguments: ConnectionSetup = req.body
        .connectionSetup as ConnectionSetup;

    if (!checkRawServerToken(setupArguments.serverToken)) {
        res.status(401).statusMessage = "Access denied";
        return null;
    }
    return setupArguments;
}

export function setupProxy(
    req: Request,
    res: Response,
    idContext: Map<string, DialogueContext>,
    approvedPeerAddresses: string[]
) {
    const setupArguments = extractSetupArgumentsFromRequestBody(req, res);
    if (!setupArguments) {
        return;
    }

    idContext.set(
        setupArguments.connectionId,
        new DialogueContext(
            setupArguments.promptContext,
            setupArguments.surveyResponseId,
            setupArguments.question
        )
    );
    approvedPeerAddresses.push(setupArguments.peerAddress);
    res.status(200);
    res.send("OK");
}
