import express from "express";
import { createServer } from "http";
import { setupProxy } from "./core/use_cases/setup_proxy";
import { Server } from "socket.io";
import { checkServerToken } from "./core/use_cases/auth";
import type { AddressInfo } from "net";
import { handlePeer } from "./core/use_cases/handle_peer";
import { LiteLLMModelImpl } from "./core/gateways/external/query_model/litellm_model_impl";
import { QuestionResponse } from "../core/entities/surveys/question_response";
import { finalizePeer } from "./core/gateways/internal/finalize_peer";
import type { ProxySetupServer } from "./core/entities/proxy_setup_server";
import { dialogueContextFromProxySetupServer } from "./core/entities/dialogue_context";
import { ModelTest } from "./core/gateways/external/query_model/test_model";
import {
    connectionIdsRouteName,
    createConnectionRouteName,
    PORT,
} from "./config";

// Injected Dependencies
const Model = ModelTest;

// CONSTANTS
export const DEV: boolean =
    process.argv.length >= 3 && process.argv[2] == "dev";
const space2 = "  ";
const space4 = "    ";
const space6 = "      ";

// Server setup
const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server);

// Storage (just on the stack for now)
const idToConnection: Map<string, ProxySetupServer> = new Map<
    string,
    ProxySetupServer
>();

// Routes
app.get("", (req, res) => {
    if (DEV) {
        console.log(`${space2}/ called`);
    }
    res.status(200);
    res.statusMessage = "OK";
    res.send();
});

app.post(`/${createConnectionRouteName}`, (req, res) => {
    if (DEV) {
        console.log(`${space2}/${createConnectionRouteName} called`);
    }
    setupProxy(req, res, idToConnection, DEV);
    res.send();
});

app.get(`/${connectionIdsRouteName}`, (req, res) => {
    if (DEV) {
        console.log(`${space2}/${connectionIdsRouteName} called`);
    }
    if (!checkServerToken(req)) {
        res.status(401).send({ error: "Unauthorized" });
        return;
    }

    res.json([...idToConnection.keys()]);
    res.status(200);
    res.send();
});

// Socket
io.use((socket, next) => {
    if (DEV) {
        console.log(`${space2}Socket connection attempted`);
        console.log(`${space4}Authenticating...`);
    }

    const connectionId = socket.handshake.auth.connectionId;
    if (!connectionId) {
        if (DEV) {
            console.log(space6, "Missing connectionId from auth header");
        }
        return next(new Error("Missing connectionId from auth header"));
    }

    const checkForConnection = idToConnection.get(connectionId);
    if (!checkForConnection) {
        if (DEV) {
            console.log(
                space6,
                `Authentication failed: no connectionId matching ${connectionId}`
            );
        }
        return next(
            new Error(
                `Authentication failed: no connectionId matching ${connectionId}`
            )
        );
    }

    if (DEV) {
        console.log(space6, "Authentication success");
    }
    return next();
});

io.on("connection", (peer) => {
    if (DEV) console.log(`${space2}Peer connected, awaiting messages...`);

    // Extract connection information
    // Existence already checked in middleware
    const connectionId = peer.handshake.auth.connectionId as string;
    const peerConnection = idToConnection.get(connectionId) as ProxySetupServer;

    // Find existing information
    const context = dialogueContextFromProxySetupServer(peerConnection);
    const questionResponseInProgress: QuestionResponse = new QuestionResponse(
        context.questionResponseId,
        context.question
    );

    // Setup handlers
    handlePeer(peer, context, new Model(), questionResponseInProgress);
    finalizePeer(peer, context, questionResponseInProgress, () => {
        idToConnection.delete(peerConnection.connectionId);
    });
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
            addr.address === "::" ? "http://localhost" : addr.address,
            "on port",
            addr.port
        );
    }
});
