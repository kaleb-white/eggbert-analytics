import { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import { ThemeColor } from "../types_enums";
import { generalUseContainerStyles } from "../container";

type Props = {borderColor: ThemeColor, text: string, additClassNames?:string} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const Message: FC<Props> = ({borderColor, additClassNames = "", text, ...rest}) => {
    return (
        <div  className={generalUseContainerStyles(borderColor, true).concat(" ").concat(additClassNames)} {...rest}>{text}</div>
    )
}
