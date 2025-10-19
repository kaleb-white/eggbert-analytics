"use server"

import { Navbar } from "@/ui/navbar/navbar";
import { ResponseSidebar } from "@/ui/sidebar/sidebar";

export default async function ResponseLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <div className="w-full h-screen flex flex-col max-h-screen">
            <Navbar />
            <div className="relative max-h-11/12 w-full flex flex-row justify-start items-center">
                <div className="absolute top-0 left-0">
                    <ResponseSidebar />
                </div>
                <div className="w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
