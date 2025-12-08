"use server"
import { ResponseSidebar } from "@/ui/navigation/sidebar/sidebar";

export default async function ResponseLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <div className="relative h-full max-h-11/12 w-full flex flex-row justify-start items-center">
            <div className="absolute top-0 left-0">
                <ResponseSidebar />
            </div>
            <div className="w-full h-full flex place-content-center">
                {children}
            </div>
        </div>
    );
}
