import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { DataProvider } from "@/context/data-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlphaFinance - Finanzverwaltung",
  description: "Interne Finanzverwaltung - Alpha IT Innovations GmbH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");document.documentElement.classList.toggle("dark",t?t==="dark":true)}catch(e){document.documentElement.classList.add("dark")}` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <DataProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex flex-1 flex-col lg:pl-64">
                <div className="flex-1 p-4 lg:p-8">{children}</div>
              </main>
            </div>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
