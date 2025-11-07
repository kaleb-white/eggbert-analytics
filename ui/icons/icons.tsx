"use client"
import { JSX, MouseEventHandler, useEffect, useRef, useState } from "react";
import { AttachRaw, BackRaw, ChartRaw, CheckRaw, DangerRaw, DeleteRaw, DownRaw, ErrorRaw, FeedRaw, FileRaw, FilterRaw, ForwardRaw, GlobeRaw, InfoRaw, LeftRaw, LockedRaw, MaximizeRaw, MinimizeRaw, NewRaw, PinRaw, QuestionRaw, RedoRaw, RightRaw, SwitchRaw, UndoRaw, UploadRaw, UpRaw, WindowRaw } from "./raw_icons";

export type onClickFuncType = (() => MouseEventHandler<HTMLDivElement> | undefined | void) | undefined
export type IconType = (edgeLengthPx: number, fillHex?: string) => JSX.Element
export type FaviconProps = {
    edgeLengthPx: number,
    onClick?: onClickFuncType,
    fillHex?: string,
    fillHexHover?: string
}
type WrapProps = FaviconProps & { icon: IconType }

function WrapIcon(props: WrapProps) {
    const fillHex = useRef(props.fillHex ? props.fillHex : "#000000")
    const fillHexHover = useRef(props.fillHexHover ? props.fillHexHover : fillHex.current)
    const [fill, setFill] = useState(fillHex.current)



    return (
        <div
            className="mx-auto"
            onClick={() => {if (props.onClick) props.onClick(); return undefined}}
            onMouseEnter={() => {setFill(fillHexHover.current)}}
            onMouseLeave={() => {setFill(fillHex.current)}}>
            {props.icon(props.edgeLengthPx, fill)}
        </div>
    )
}

export function Attach(props: FaviconProps) {
	return <WrapIcon icon={AttachRaw} {...props} />
}

export function Back(props: FaviconProps) {
	return <WrapIcon icon={BackRaw} {...props} />
}

export function Chart(props: FaviconProps) {
	return <WrapIcon icon={ChartRaw} {...props} />
}

export function Check(props: FaviconProps) {
	return <WrapIcon icon={CheckRaw} {...props} />
}

export function Danger(props: FaviconProps) {
	return <WrapIcon icon={DangerRaw} {...props} />
}

export function Delete(props: FaviconProps) {
	return <WrapIcon icon={DeleteRaw} {...props} />
}

export function Down(props: FaviconProps) {
	return <WrapIcon icon={DownRaw} {...props} />
}

export function Error(props: FaviconProps) {
	return <WrapIcon icon={ErrorRaw} {...props} />
}

export function File(props: FaviconProps) {
	return <WrapIcon icon={FileRaw} {...props} />
}

export function Filter(props: FaviconProps) {
	return <WrapIcon icon={FilterRaw} {...props} />
}

export function Forward(props: FaviconProps) {
	return <WrapIcon icon={ForwardRaw} {...props} />
}

export function Globe(props: FaviconProps) {
	return <WrapIcon icon={GlobeRaw} {...props} />
}

export function Info(props: FaviconProps) {
	return <WrapIcon icon={InfoRaw} {...props} />
}

export function Left(props: FaviconProps) {
	return <WrapIcon icon={LeftRaw} {...props} />
}

export function Locked(props: FaviconProps) {
	return <WrapIcon icon={LockedRaw} {...props} />
}

export function Maximize(props: FaviconProps) {
	return <WrapIcon icon={MaximizeRaw} {...props} />
}

export function Minimize(props: FaviconProps) {
	return <WrapIcon icon={MinimizeRaw} {...props} />
}

export function Pin(props: FaviconProps) {
	return <WrapIcon icon={PinRaw} {...props} />
}

export function Question(props: FaviconProps) {
	return <WrapIcon icon={QuestionRaw} {...props} />
}

export function Redo(props: FaviconProps) {
	return <WrapIcon icon={RedoRaw} {...props} />
}

export function Right(props: FaviconProps) {
	return <WrapIcon icon={RightRaw} {...props} />
}

export function Undo(props: FaviconProps) {
	return <WrapIcon icon={UndoRaw} {...props} />
}

export function Up(props: FaviconProps) {
	return <WrapIcon icon={UpRaw} {...props} />
}

export function Upload(props: FaviconProps) {
	return <WrapIcon icon={UploadRaw} {...props} />
}

export function Window(props: FaviconProps) {
	return <WrapIcon icon={WindowRaw} {...props} />
}

export function New(props: FaviconProps) {
	return <WrapIcon icon={NewRaw} {...props} />
}

export function Switch(props: FaviconProps) {
	return <WrapIcon icon={SwitchRaw} {...props} />
}

export function Feed(props: FaviconProps) {
	return <WrapIcon icon={FeedRaw} {...props} />
}
