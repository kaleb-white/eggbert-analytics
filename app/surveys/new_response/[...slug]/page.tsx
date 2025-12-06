import { redirect } from "next/navigation"

export default async function NewResponse({ params }:{ params: Promise<{slug: string}>}) {
    const {slug} = await params

    redirect(`/api/surveys/new_response/${slug}`)
}
