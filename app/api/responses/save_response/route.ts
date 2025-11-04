import { Response as ResponseEntity } from "@/core/entities/surveys/response";
import { storage } from "@/core/injections";
import { reconstructResponse } from "@/utilities/reconstruct_obj/reconstruct_response";
import { isResponse } from "@/utilities/type_checks";

export async function POST(request: Request) {
    if (!request.headers.has("authorization")) {
        return new Response(null, {
            status: 401,
            statusText: "Missing authorization header",
        });
    }

    if (!process.env.EXPECTED_SERVER_TOKEN) {
        return new Response(null, {
            status: 500,
            statusText: "Server is missing server token",
        });
    }

    if (
        !(
            request.headers.get("authorization") ==
            process.env.EXPECTED_SERVER_TOKEN
        )
    ) {
        return new Response(null, {
            status: 401,
            statusText: "Not authorized",
        });
    }

    if (!request.body) {
        return new Response(null, { status: 400, statusText: "Missing body" });
    }

    const bodyText = await (await request.blob()).text();
    let body: object = {};
    try {
        body = JSON.parse(bodyText);
    } catch (err) {
        return new Response(null, {
            status: 400,
            statusText: `Failed to parse body because of err: ${err}`,
        });
    }

    if (!Object.keys(body).includes("response")) {
        return new Response(null, {
            status: 400,
            statusText: `Failed to parse body because it did not contain response field, body was: ${body}`,
        });
    }

    let response: ResponseEntity | null = null;
    try {
        response = reconstructResponse(body["response"]);
    } catch (err) {
        return new Response(null, {
            status: 400,
            statusText: `Failed to parse body because of err: ${err}`,
        });
    }

    if (!isResponse(response)) {
        return new Response(null, {
            status: 400,
            statusText: `Failed to reconstruct response (type check failed), response was: ${JSON.stringify(
                response
            )}`,
        });
    }

    const saveResult = await storage.save(response.uniqueId, response);
    if (saveResult instanceof Error) {
        return new Response(null, {
            status: 400,
            statusText: `Failed to save response with message: ${saveResult.message}`,
        });
    }

    return new Response(null, { status: 200 });
}
