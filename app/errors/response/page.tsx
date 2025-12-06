"use server"

import { decodeErrorFromUri } from "@/utilities/encode_error_uri"
import { ResponseError } from "../_entities"

export default async function ResponsesErrorsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const err = (await searchParams).err
    const responseErrors = decodeErrorFromUri<ResponseError>(err, ["msg"])
    return (
        <div>{responseErrors? responseErrors.msg : "Unrecognized error while trying to access survey response! Sorry."}</div>
    )
}
