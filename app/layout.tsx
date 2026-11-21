import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import { AgentTools } from "@/components/agent-tools";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { jsonLd } from "@/lib/jsonld";
import { pageMetadata, SITE } from "@/lib/site";
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
  ...pageMetadata({
    path: "/",
    title: "Studio Pro — WhatsApp",
    description:
      "AI-powered WhatsApp assistant by Studio Pro. Turn WhatsApp into a sales channel with AI auto-replies, a unified inbox and one-click human handoff.",
  }),
  metadataBase: new URL(SITE.origin),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppNav />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        <AgentTools />
        <Toaster richColors position="top-center" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
