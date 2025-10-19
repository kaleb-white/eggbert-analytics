import { JSX, MouseEventHandler } from "react";
import { AttachRaw, BackRaw, ChartRaw, CheckRaw, DangerRaw, DeleteRaw, DownRaw, ErrorRaw, FeedRaw, FileRaw, FilterRaw, ForwardRaw, GlobeRaw, LockedRaw, MaximizeRaw, MinimizeRaw, NewRaw, PinRaw, RedoRaw, SwitchRaw, UndoRaw, UploadRaw, UpRaw, WindowRaw } from "./raw_icons";

export type onClickFuncType = (() => MouseEventHandler<HTMLDivElement> | undefined | void) | undefined

function wrapIcon(icon: JSX.Element, onClick?: onClickFuncType) {
    return ( <div  className="mx-auto" onClick={() => {if (onClick) onClick(); return undefined}}>
        {icon}
        </div>
    )
}

export function Attach({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(AttachRaw(edgeLengthPx, fillHex), onClick)
}

export function Back({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(BackRaw(edgeLengthPx, fillHex), onClick)
}

export function Chart({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(ChartRaw(edgeLengthPx, fillHex), onClick)
}

export function Check({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(CheckRaw(edgeLengthPx, fillHex), onClick)
}

export function Danger({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(DangerRaw(edgeLengthPx, fillHex), onClick)
}

export function Delete({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(DeleteRaw(edgeLengthPx, fillHex), onClick)
}

export function Down({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(DownRaw(edgeLengthPx, fillHex), onClick)
}

export function Error({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(ErrorRaw(edgeLengthPx, fillHex), onClick)
}

export function File({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(FileRaw(edgeLengthPx, fillHex), onClick)
}

export function Filter({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(FilterRaw(edgeLengthPx, fillHex), onClick)
}

export function Forward({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(ForwardRaw(edgeLengthPx, fillHex), onClick)
}

export function Globe({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(GlobeRaw(edgeLengthPx, fillHex), onClick)
}

export function Locked({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(LockedRaw(edgeLengthPx, fillHex), onClick)
}

export function Maximize({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(MaximizeRaw(edgeLengthPx, fillHex), onClick)
}

export function Minimize({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(MinimizeRaw(edgeLengthPx, fillHex), onClick)
}

export function Pin({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(PinRaw(edgeLengthPx, fillHex), onClick)
}

export function Redo({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(RedoRaw(edgeLengthPx, fillHex), onClick)
}

export function Undo({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(UndoRaw(edgeLengthPx, fillHex), onClick)
}

export function Up({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(UpRaw(edgeLengthPx, fillHex), onClick)
}

export function Upload({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(UploadRaw(edgeLengthPx, fillHex), onClick)
}

export function Window({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(WindowRaw(edgeLengthPx, fillHex), onClick)
}

export function New({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(NewRaw(edgeLengthPx, fillHex), onClick)
}

export function Switch({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(SwitchRaw(edgeLengthPx, fillHex), onClick)
}

export function Feed({edgeLengthPx, onClick, fillHex = "#000000"}: {edgeLengthPx: number, onClick?: onClickFuncType, fillHex?: string}) {
	return wrapIcon(FeedRaw(edgeLengthPx, fillHex), onClick)
}
