import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/ui/navigation/navbar/navbar";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: "300"
});

export const metadata: Metadata = {
  title: "Eggbert Analytics"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
            className={`${openSans.variable} antialiased`}
        >
            <div className="w-full h-screen flex flex-col max-h-screen">
                <Navbar />
                {children}
            </div>
        </body>
    </html>
  );
}
