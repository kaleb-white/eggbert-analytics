import { SurveyError } from "@/app/errors/_entities";
import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Response } from "@/core/entities/surveys/response";
import { Survey } from "@/core/entities/surveys/survey";
import { Turn } from "@/core/entities/surveys/turn";
import { User } from "@/core/entities/users/user";
import { newSessionCookie } from "@/core/gateways/external/user_server_actions_impl";
import {
    sessionController,
    storage,
    uniqueIdGen,
    userController,
} from "@/injections";
import { encodeErrorToUri } from "@/utilities/encode_error_uri";
import { reconstructSession } from "@/utilities/reconstruct_obj/reconstruct_session";
import { isSession } from "@/utilities/type_checks";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function redirectWithError(error: SurveyError) {
    redirect(`/errors/survey${encodeErrorToUri(error)}`);
}

async function saveNewAnonymousUserAndSession(): Promise<string> {
    // Create a cookie with a new anonymous user if there isn't
    const user = new User({
        email: uniqueIdGen.createUniqueId(),
        lastLogin: Date.now(),
        timeCreated: Date.now(),
        role: "anonymous",
        uniqueId: uniqueIdGen.createUniqueId(),
    });

    const saveUser = await userController.createOrUpdateUser(
        user,
        uniqueIdGen.createUniqueId()
    );
    if (saveUser instanceof Error) {
        redirectWithError({ msg: saveUser.message });
        return "";
    }

    const saveSession = await sessionController.createAndSaveSession(user);
    if (saveSession instanceof Error) {
        redirectWithError({ msg: saveSession.message });
        return "";
    }

    await newSessionCookie(saveSession);
    return user.uniqueId;
}

export async function GET(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ slug: string }>;
    }
) {
    const { slug } = await params;

    // Check that the requested survey exists
    // TODO: security? rate limits?
    const maybeSurvey = await storage.get(slug[0], new Survey());
    let maybeError: SurveyError | null = null;
    if (!maybeSurvey) {
        maybeError = { msg: `No survey found with id ${slug}.` };
    } else if (maybeSurvey instanceof Error) {
        maybeError = {
            msg: `An error occured while getting the requested survey: \n\t${maybeSurvey.message}`,
        };
    }

    if (maybeError) {
        redirectWithError(maybeError);
    }

    // Check if there is a session cookie
    const cookieStore = await cookies();
    let userId;
    if (!cookieStore.has("session")) {
        userId = await saveNewAnonymousUserAndSession();
    } else {
        const session = reconstructSession(
            decodeURI(cookieStore.get("session")!.value)
        );
        if (!isSession(session)) {
            redirectWithError({ msg: "Invalid session cookie." });
        }
        userId = session.userId;
    }

    // Create a new response
    const newResponseId = uniqueIdGen.createUniqueId();
    const newResponse = new Response({
        lastEdited: Date.now(),
        questionResponses: (maybeSurvey as Survey).questions.map((q) => {
            const qr = new QuestionResponse({
                question: q,
                responseId: newResponseId,
                uniqueId: uniqueIdGen.createUniqueId(),
                timeCreated: Date.now(),
            });
            qr.transcript = [
                new Turn({
                    uniqueId: uniqueIdGen.createUniqueId(),
                    questionResponseId: qr.uniqueId,
                }),
            ];
            return qr;
        }),
        respondentId: userId,
        surveyId: slug[0],
        timeCreated: Date.now(),
        uniqueId: newResponseId,
    });

    // Persist the response
    const saveNewResponse = await storage.save(
        newResponse.uniqueId,
        newResponse
    );
    if (saveNewResponse) {
        redirectWithError({
            msg: `Failed to create a new response with error: ${saveNewResponse.message}.`,
        });
    }

    // Redirect to the response
    redirect(`/responses/chat/${newResponse.uniqueId}`);
}
