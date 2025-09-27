import express from "express";
import { createServer } from "http";
import { setupProxy } from "./core/use_cases/setup_proxy";
import { Server } from "socket.io";
import { checkServerToken } from "./core/use_cases/auth";
import type { AddressInfo } from "net";
import type { DialogueContext } from "./core/entities/response_context";
import { handlePeer } from "./core/use_cases/handle_peer";
import { LiteLLMModelImpl } from "./core/use_cases/query_model/litellm_model_impl";
import { SurveyResponse } from "../core/entities/surveys/survey_response";
import { finalizePeer } from "./core/gateways/server_gateway/finalize_peer";

// CONSTANTS
export const PORT = 1038;
export const DEV: boolean =
    process.argv.length >= 3 && process.argv[2] == "dev";
const space2 = "  ";
const space4 = "    ";

// Server setup
const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server);

// Storage (just on the stack for now)
const approvedPeerAddresses: string[] = [];
const idToContext: Map<string, DialogueContext> = new Map<
    string,
    DialogueContext
>();

// Routes
app.post("/create-connection", (req, res) => {
    if (DEV) {
        console.log(`${space2}/create-connection called`);
    }
    setupProxy(req, res, idToContext, approvedPeerAddresses);
});

app.get("/connection-ids", (req, res) => {
    if (DEV) {
        console.log(`${space2}/connection-ids called`);
    }
    if (!checkServerToken(req)) {
        res.status(401).send({ error: "Unauthorized" });
        return;
    }

    res.json([...idToContext.keys()]);
    res.status(200);
});

// Socket
io.use((socket, next) => {
    if (DEV) {
        console.log(`${space2}socket connection attempted`);
    }

    const headers = socket.handshake.headers;
    const err = new Error("none");
    if (
        !Object.keys(headers).includes("connectionid") ||
        headers["connectionid"] == undefined
    ) {
        err.message = "Missing connectionId from headers";
    }

    if (!idToContext.get(headers["connectionid"] as string)) {
        err.message = "Unauthorized";
    }

    if (err.message != "none") {
        if (DEV) {
            console.log(`${space4}error durring connection: ${err.message}`);
        }
        return next(err);
    }

    console.log(`${space4}middleware did not err`);

    return next();
});

io.on("connection", (peer) => {
    if (DEV) console.log(`${space2}Peer connected`);

    if (!peer.request.headers["connectionid"]) {
        peer.disconnect();
        return;
    }

    const context = idToContext.get(
        peer.request.headers["connectionId"] as string
    ) as DialogueContext;

    const surveyResponseInProgress: SurveyResponse = new SurveyResponse(
        context.surveyResponseId,
        context.question
    );

    handlePeer(peer, context, new LiteLLMModelImpl(), surveyResponseInProgress);
    finalizePeer(peer, context, surveyResponseInProgress);
});

server.listen(PORT, () => {
    if (!server.address()) {
        server.close();
    }

    if (server.address() instanceof String) {
        console.log("Model client proxy listening at", server.address());
    } else {
        const addr = server.address() as AddressInfo;
        console.log(
            "Model client proxy listening at",
            addr.address === "::" ? "https://localhost" : addr.address,
            "on port",
            addr.port
        );
    }
});
