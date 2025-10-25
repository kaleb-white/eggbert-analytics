import { Logo } from "../../icons/logo";

export function Navbar() {
    return (
        // Changing height will fuck with chatbox as together they must have a max height = 100% of parent
        <div className="w-full flex flex-row justify-start border-secondary border-b-4 min-h-1/12">
            <Logo width={120} />
        </div>
    )
}
