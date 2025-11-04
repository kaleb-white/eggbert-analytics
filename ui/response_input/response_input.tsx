"use client"
import { RefObject, useLayoutEffect, useRef, useState } from "react";
import { Container } from "../container";
import { Upload } from "../icons/icons";
import { ThemeColorHex } from "../types_enums";
import { textInputMaxLinesBeforeScroll, textInputPlaceholder, textInputTextAreaLineHeight, textInputUploadFaviconSize } from "../magic_constants";

export function ResponseInput({onSubmit, enabled}: {onSubmit: (respondentMessage: string) => Promise<void | unknown>, enabled: boolean}) {
    const [focused, setFocused] = useState(false)
    const [textAreaHeightPx, setTextAreaHeight] = useState(textInputTextAreaLineHeight)
    const [textAreaValue, setTextAreaValue] = useState("")
    const inputRef = useRef(null)

    useLayoutEffect(() => {
        if (inputRef == null) return;
        const inputRefNotNull = ((inputRef as unknown) as RefObject<HTMLTextAreaElement>)

        // Extract actual content height and reset height
        const height = inputRefNotNull.current.style.height
        inputRefNotNull.current.style.height = "0px"
        const contentHeight = inputRefNotNull.current.scrollHeight
        inputRefNotNull.current.style.height = height

        // Calculate num lines
        const numLinesNeeded = contentHeight / textInputTextAreaLineHeight
        const numLinesProvided = Math.min(textInputMaxLinesBeforeScroll, numLinesNeeded)
        setTextAreaHeight(numLinesProvided * textInputTextAreaLineHeight)
    }, [textAreaValue])

    function resetInputIfExists() {
        if (inputRef == null) return
        ((inputRef as unknown) as RefObject<HTMLTextAreaElement>).current.value = ""
        setTextAreaValue("")
    }

    async function submitFaviconClicked() {
        setFocused(false);
        resetInputIfExists()
        await onSubmit(textAreaValue)
    }

    return (
        <Container additClassNames="w-full overflow-y-auto items-end" changeColorOnHover={false} onFocus={() => {setFocused(true)}} onBlur={()=> {setFocused(false)}}>
            <textarea
                disabled={!enabled}
                onChange={(e) => {setTextAreaValue(e.target.value)}}
                ref={inputRef}
                placeholder={textInputPlaceholder}
                rows={1}
                style={{"height": textAreaHeightPx}}
                className="placeholder:italic resize-none outline-0 w-full p-1 mr-1 overflow-y-auto"
            />
            <div className="contents" onClick={submitFaviconClicked}>
                <Upload
                    edgeLengthPx={textInputUploadFaviconSize}
                    fillHex={!enabled? ThemeColorHex.disabled : focused ? ThemeColorHex["tertiary-bold"] : ThemeColorHex.tertiary}
                />
            </div>
        </Container>
    )
}
