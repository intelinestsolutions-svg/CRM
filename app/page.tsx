import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Inbox,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Inbox,
    title: "Unified inbox",
    description: "Every WhatsApp conversation in one place, with unread counts and full history.",
  },
  {
    icon: Bot,
    title: "AI auto-replies",
    description: "Your agent answers instantly, in your customers' language, 24/7.",
  },
  {
    icon: Users,
    title: "Human handoff",
    description: "Take over a thread with one click and hand it back to the bot when you're done.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "Your own WhatsApp session, your own database — nothing routed through a third party.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-50 via-background to-background p-8 sm:p-12 dark:from-emerald-950/40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-3.5" />
            Agentic chat powered by AI
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Turn WhatsApp into your best{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              sales channel
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            WACRM connects your WhatsApp number, replies to customers automatically, and puts a
            human in the loop exactly when it matters.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href="/connect" />}>
              <QrCode className="size-4" />
              Connect WhatsApp
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/inbox" />}>
              Open inbox
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="gap-3 transition-shadow hover:shadow-md">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Icon className="size-4.5" />
              </span>
              <CardTitle className="mt-2">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Image
            src="/studio-pro-logo.png"
            alt="Studio Pro"
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-xl bg-background object-contain ring-1 ring-border"
          />
          <div>
            <p className="font-medium">Built by Studio Pro</p>
            <p className="text-sm text-muted-foreground">
              Web design &amp; development in Kota Kinabalu, Sabah.{" "}
              <a
                href="https://prostudio.my"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
              >
                prostudio.my
              </a>
            </p>
          </div>
        </div>
        <Button variant="outline" render={<Link href="/connect" />}>
          Connect WhatsApp
          <ArrowRight className="size-4" />
        </Button>
      </section>
    </div>
  );
}
