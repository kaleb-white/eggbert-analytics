"use client"
import { ReactNode, useState } from "react";

export function Button({ children, onClick, tooltip }: {children?: ReactNode, onClick?: () => Promise<void>, tooltip?: string}) {
    const [disabled, setDisabled] = useState(false)
    const onClickWrapper = async () => {
        if (!onClick) return
        setDisabled(true)
        await onClick()
        setDisabled(false)
    }

    return (
        <div onClick={async () => {await onClickWrapper()}} className={`cursor-pointer rounded-lg p-1 text-sm flex flex-row gap-1.5 justify-center items-center border-2 bg-none hover:bg-secondary ${disabled? "border-primary-subtle" : "border-primary-bold"}`} aria-label={tooltip} title={tooltip}>
            {children}
        </div>
    )
}
