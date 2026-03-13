import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "Social Code — Crack the Code of Human Connection",
  description: "Social Code gives introverts the actual mechanics to start conversations, build real connections, and stop overthinking.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${outfit.variable} ${workSans.variable} ${outfit.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
