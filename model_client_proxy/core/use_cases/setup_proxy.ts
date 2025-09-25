import type { Request, Response } from "express";
import { ConnectionSetup } from "../entities/connection_setup";
import { checkRawServerToken } from "./auth";

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
    if (
        !Object.keys(req).includes("body") ||
        !Object.keys(req.body).includes("serverToken") ||
        !checkRawServerToken(req.body.serverToken)
    ) {
        res.status(401).send({
            message: "Access denied",
        });
        return null;
    }

    const foundRequestFields = Object.keys(req.body);
    const fieldsMissingFromRequest = checkRequestFields(foundRequestFields);

    if (fieldsMissingFromRequest.length > 0) {
        res.status(400).send({
            message:
                "A server request was missing these fields during setup: " +
                fieldsMissingFromRequest.join(", "),
        });
        return null;
    }

    const setupArguments: ConnectionSetup = req.body as ConnectionSetup;

    if (!checkRawServerToken(setupArguments.serverToken)) {
        res.status(401).send({
            message: "Access denied",
        });
        return null;
    }
    return setupArguments;
}

export function setupProxy(
    req: Request,
    res: Response,
    idAndContext: Map<string, string>,
    approvedPeerAddresses: string[]
) {
    const setupArguments = extractSetupArgumentsFromRequestBody(req, res);
    if (!setupArguments) {
        return;
    }

    idAndContext.set(setupArguments.connectionId, setupArguments.context);
    approvedPeerAddresses.push(setupArguments.peerAddress);
    res.status(200);
    res.send("OK");
}
