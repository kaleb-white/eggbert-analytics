import { ReactNode } from "react";

export default function ErrorsLayout({ children }: {children: ReactNode}) {
    return (
        <div className="w-full h-full text-2xl flex flex-col justify-center items-center">
            {children}
        </div>
    )
}
