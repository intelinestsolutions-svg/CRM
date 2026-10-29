"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, QrCode, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/connect", label: "Connect", icon: QrCode },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="mr-1 flex items-center gap-2.5 font-semibold tracking-tight">
          <Image
            src="/studio-pro-logo.png"
            alt="Studio Pro"
            width={32}
            height={32}
            className="size-8 rounded-lg object-contain"
            priority
          />
          <span className="hidden leading-tight sm:flex sm:flex-col">
            <span className="text-[0.95rem]">Studio Pro</span>
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              WhatsApp CRM
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 text-sm">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground sm:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          AI agent online
        </div>
      </div>
    </header>
  );
}
