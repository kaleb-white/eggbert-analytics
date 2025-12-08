import { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import { ThemeColor } from "./types_enums";

export function generalUseContainerStyles(borderColor: ThemeColor, changeColorOnHover: boolean) {
    const base = "flex flex-row items-center w-fit h-fit p-1 rounded-lg border-4 shadow-lg bg-white ";
    let final = base
    if (changeColorOnHover) {
        const hover = " ".concat("hover:border-").concat(borderColor).concat("-subtle hover:bg-").concat(borderColor).concat("-subtle ")
        final = final.concat(hover)
    }
    const border = " ".concat("border-").concat(borderColor)
    final = final.concat(border)
    return final
}

export type Props = {borderColor?: ThemeColor, changeColorOnHover?: boolean, additClassNames?: string} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const Container: FC<Props> = ({borderColor = "primary", changeColorOnHover = false, additClassNames="", children, ...rest}: Props) => {
    return (
        <div className={generalUseContainerStyles(borderColor, changeColorOnHover).concat(" ").concat(additClassNames)} {...rest}>{children}</div>
    )
}
