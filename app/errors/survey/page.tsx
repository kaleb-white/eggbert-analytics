"use server"

import { decodeErrorFromUri } from "@/utilities/encode_error_uri"
import { SurveyError } from "../_entities"


export default async function SurveysErrorsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const err = (await searchParams).err
    const surveyErrors = decodeErrorFromUri<SurveyError>(err, ["msg"])
    return (
        <div>
            {surveyErrors? surveyErrors.msg : "Unrecognized error while trying to access survey survey! Sorry."}
        </div>
    )
}
