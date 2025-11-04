import { Message } from "./message"

/*
    hover:border-tertiary-subtle
    hover:bg-tertiary-subtle
    border-tertiary
    border-tertiary-bold
*/

export const RespondentMessage = ({text}: {text: string}) => {
    return (
        <Message borderColor="tertiary" text={text} additClassNames="text-black w-full rounded-br-none"/>
    )
}
