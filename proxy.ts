import { NextRequest, NextResponse } from "next/server";
import { isSession } from "./utilities/type_checks";
import { reconstructSession } from "./utilities/reconstruct_obj/reconstruct_session";
import { storage } from "./injections";
import { Response } from "./core/entities/surveys/response";

function responsesErrorUrlConfigurer(
    msg: string,
    request: NextRequest
): NextResponse {
    // It would be nice to define this logic in the error page itself, especially the type of the object, but Next.js recommends separating the proxy fully (no imports), so it can be deployed closer to user
    const encodedResponseError = encodeURI(JSON.stringify({ msg: msg }));
    const newResponse = NextResponse.rewrite(
        new URL(`/errors/response?err=${encodedResponseError}`, request.url)
    );
    return newResponse;
}

export async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/responses/chat")) {
        // Get response
        const responseId = request.nextUrl.pathname.split("/")[3];
        if (!responseId)
            return responsesErrorUrlConfigurer(
                "There is no responses landing page. Please include a response id in the url.",
                request
            );
        const response = await storage.get(responseId, new Response());
        if (!response)
            return responsesErrorUrlConfigurer(
                `No response found with the id ${responseId}.`,
                request
            );
        if (response instanceof Error)
            return responsesErrorUrlConfigurer(
                `An error happened while trying to retrieve the response: ${response.message}. If you do not recognize the error, contact a site administrator.`,
                request
            );

        // Get cookie
        const sessionCookie = request.cookies.get("session");
        if (!sessionCookie)
            return responsesErrorUrlConfigurer("Not signed in!", request);
        const session = reconstructSession(decodeURI(sessionCookie.value));
        if (!isSession(session)) {
            return responsesErrorUrlConfigurer(
                "Don't fuck with the session cookie",
                request
            );
        }

        console.log("session in proxy", session);

        // Check response id
        if (!(session.userId === response.respondentId)) {
            console.log("not authorized");
            return responsesErrorUrlConfigurer("Not authorized.", request);
        }
        return NextResponse.next();
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/responses/:path*"],
};
