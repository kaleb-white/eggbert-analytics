import { Message } from "./message"

/*
    hover:bg-info-subtle
    hover:border-info-subtle
    border-info
    border-info-bold
*/

export const ModelMessage = ({text}: {text: string}) => {
    return (
        <Message borderColor="info" text={text} additClassNames="text-black/70 w-full rounded-bl-none"/>
    )
}
