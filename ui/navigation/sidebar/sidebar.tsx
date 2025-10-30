"use client"

import {  useState } from "react";
import {  Chart, Delete, Maximize, Minimize, New, onClickFuncType, Switch } from "../../icons/icons";
import { ThemeColorHex } from "../../types_enums";


function IconContainer({children, onClick, tooltip}: {children, onClick?:onClickFuncType, tooltip: string}) {
    return (
        <div aria-label={tooltip} title={tooltip} className="flex flex-row items-center w-fit h-fit rounded-lg border-primary hover:border-primary-bold hover:bg-primary-bold border-4 shadow-lg" onClick={onClick}>{children}</div>
    )
}

export function ResponseSidebar() {
    const edgeLengthPx = 48
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const responseSidebarConfig = [
        {
            icon: New,
            onClick: () => {},
            description: "Start a new response",
            tooltip: "New response"
        },
        {
            icon: Delete,
            onClick: () => {},
            description: "Delete a previous response",
            tooltip: "Delete response"
        },
        {
            icon: Chart,
            onClick: () => {},
            description: "See your results",
            tooltip: "Results"
        },
        {
            icon: Switch,
            onClick: () => {},
            description: "Switch survey",
            tooltip: "Switch survey"
        }
    ]

    return (
    <div className="flex flex-col items-end gap-2.5 p-1 m-1 ml-0 w-fit h-fit rounded-lg rounded-l-none border-secondary border-3 border-l-0 font-light text-lg">
        <IconContainer onClick={() => {setSidebarOpen(openOrClosed => !openOrClosed)}} tooltip={sidebarOpen? "Minimize sidebar": "Maximize sidebar"}>
                {sidebarOpen?
                    <div className="m-1">Minimize</div> : <></>
                }
                {sidebarOpen? <Minimize edgeLengthPx={edgeLengthPx} fillHex={ThemeColorHex["tertiary-bold"]}/> : <Maximize edgeLengthPx={edgeLengthPx}  fillHex={ThemeColorHex["tertiary-bold"]}/>}
        </IconContainer>
        {responseSidebarConfig.map((option, i) => (
                <IconContainer key={i} onClick={() => {option.onClick()}} tooltip={option.tooltip}>
                    {sidebarOpen? <div className="m-1">{option.description}</div> : <></>}
                    <option.icon edgeLengthPx={edgeLengthPx} fillHex={ThemeColorHex["tertiary-bold"]}/>
                </IconContainer>
        ))}
    </div>)
}
