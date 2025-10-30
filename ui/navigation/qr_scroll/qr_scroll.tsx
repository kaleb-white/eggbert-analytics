import { QuestionResponse } from "@/core/entities/surveys/question_response";
import { Response } from "@/core/entities/surveys/response";
import { Feed, Left, Right } from "@/ui/icons/icons";
import { qrScrollFaviconSize } from "@/ui/magic_constants";
import { ThemeColorHex } from "@/ui/types_enums";
import { ReactElement } from "react";

export function QuestionResponseScroll({ response, currentId, onChange }: { response: Response, currentId: string, onChange: (selectedId: string) => void }) {
    // Figure out list index
    let currentQrIdx = 0
    response.questionResponses.forEach((qr, i) => {
        if (qr.uniqueId == currentId) {
            currentQrIdx = i
        }
    })

    function Base({ qr, textDiv, onClick }: { qr: QuestionResponse, textDiv: ReactElement, onClick: (selectedId: string) => void }) {
        return (
            <div className="flex flex-row w-full min-w-24 hover:bg-primary-subtle cursor-pointer border-b-2 border-tertiary p-1 gap-1 justify-start items-center" onClick={() => onClick(qr.uniqueId)}>
                <div className="grow-0">
                <Feed edgeLengthPx={qrScrollFaviconSize} fillHex={ThemeColorHex.tertiary} />
                </div>
                {textDiv}
            </div>
        )
    }

    function TwoAway({ qr, onClick }: { qr: QuestionResponse, onClick: (selectedId: string) => void }) {
        const textDiv = <div className="font-light text-black/70 text-xs"> {qr.question.question} </div>
        return (
            <Base qr={qr} textDiv={textDiv} onClick={onClick} />
        )
    }

    function OneAway({ qr, onClick }: { qr: QuestionResponse, onClick: (selectedId: string) => void }) {
        const textDiv = <div className="text-sm"> {qr.question.question} </div>
        return (
            <Base qr={qr} textDiv={textDiv} onClick={onClick} />
        )
    }

    function Exact({ qr }: { qr: QuestionResponse }) {
        const textDiv = <div className="font-semibold"> {qr.question.question} </div>
        return (
            <Base qr={qr} textDiv={textDiv} onClick={() => {}} />
        )
    }

    function navigateBack() {
        if (currentQrIdx == 0) return
        onChange(response.questionResponses[currentQrIdx - 1].uniqueId)
    }

    function navigateForward() {
        if (currentQrIdx == response.questionResponses.length - 1) return
        onChange(response.questionResponses[currentQrIdx + 1].uniqueId)
    }

    return (
        <div className="flex flex-col w-fit h-fit min-w-2xs max-w-2xs m-1">
            <div className="flex flex-col pt-1 pb-1 w-full">
                {response.questionResponses.map(((qr, i) => {
                    if (i > currentQrIdx + 2 || i < currentQrIdx - 2) return <div key={i} className="hidden" />
                    if (i > currentQrIdx + 1 || i < currentQrIdx - 1) return <TwoAway key={i} qr={qr} onClick={onChange} />
                    if (i > currentQrIdx || i < currentQrIdx ) return <OneAway key={i} qr={qr} onClick={onChange} />
                    return <Exact key={i} qr={qr} />
                }))}
            </div>
            <div className="flex flex-row gap-2 justify-start">
                <div className="grow-0 cursor-pointer">
                    <Left onClick={() => navigateBack()} edgeLengthPx={qrScrollFaviconSize} fillHex={ThemeColorHex.tertiary} fillHexHover={ThemeColorHex["tertiary-bold"]}/>
                </div>
                <div className="grow-0 cursor-pointer">
                    <Right onClick={() => navigateForward()} edgeLengthPx={qrScrollFaviconSize} fillHex={ThemeColorHex.tertiary} fillHexHover={ThemeColorHex["tertiary-bold"]}/>
                </div>
            </div>
        </div>
    )
}
