import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "Social Code — Crack the Code of Real Human Connection",
  description: "Social Code gives introverts the real mechanics to start conversations, build genuine connections, and stop overthinking every interaction.",
  openGraph: {
    title: "Social Code — Crack the Code of Real Human Connection",
    description: "Still awkward. Still weird. Just competent. Science-backed social frameworks for introverts grounded in Jungian psychology.",
    url: "https://app.joinsocialcode.com",
    siteName: "Social Code",
    images: [{ url: "https://app.joinsocialcode.com/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Code — Crack the Code of Real Human Connection",
    description: "Still awkward. Still weird. Just competent.",
    images: ["https://app.joinsocialcode.com/og-image.png"],
  },
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
