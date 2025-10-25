"use client"
import { Navbar } from "@/ui/navigation/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <Navbar />
        {children}
    </div>
  );
}
