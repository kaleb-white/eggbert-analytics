import { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import { generalUseContainerStyles } from "@/ui/container";
import { ThemeColor } from "@/ui/types_enums";

type Props = {borderColor: ThemeColor, text: string, additClassNames?:string} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const Message: FC<Props> = ({borderColor, additClassNames = "", text, ...rest}) => {
    return (
        <div  className={generalUseContainerStyles(borderColor, true).concat(" ").concat(additClassNames)} {...rest}>{text}</div>
    )
}
