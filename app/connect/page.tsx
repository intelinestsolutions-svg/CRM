"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  QrCode,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = {
  status: string;
  qr: string | null;
  error?: string | null;
};

const statusMeta: Record<
  string,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  connected: {
    label: "Connected",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: Wifi,
  },
  qr: {
    label: "Waiting for scan",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: QrCode,
  },
  connecting: {
    label: "Connecting",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: Loader2,
  },
  logged_out: {
    label: "Logged out",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: WifiOff,
  },
  error: {
    label: "Error",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: AlertCircle,
  },
  disconnected: {
    label: "Not connected",
    className: "border-border bg-muted text-muted-foreground",
    icon: WifiOff,
  },
};

export default function ConnectPage() {
  const [status, setStatus] = useState<Status>({ status: "disconnected", qr: null });
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/start", { cache: "no-store" });
      const data: Status = await res.json();
      setStatus(data);
      if (data.error) setError(data.error);
    } catch {
      setError("Cannot reach the server. Check that the app is running.");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [load]);

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/start", { method: "POST" });
      const data: Status = await res.json();
      setStatus(data);
      if (!res.ok) setError(data.error || "Could not start the WhatsApp session.");
    } catch {
      setError("Could not start the WhatsApp session. Check the server logs.");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/start", { method: "DELETE" });
      const data: Status = await res.json();
      setStatus(data);
    } catch {
      setError("Could not reset the session. Try again.");
    } finally {
      setResetting(false);
    }
  };

  const meta = statusMeta[status.status] ?? statusMeta.disconnected;
  const StatusIcon = meta.icon;
  const isConnected = status.status === "connected";
  const isBusy = loading || resetting || status.status === "connecting";
  const showReset = status.status === "logged_out" || status.status === "error";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Connect WhatsApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Link your number by scanning a QR code with WhatsApp on your phone.
          </p>
        </div>
        <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1", meta.className)}>
          <StatusIcon className={cn("size-3.5", status.status === "connecting" && "animate-spin")} />
          {meta.label}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device link</CardTitle>
          <CardDescription>
            WhatsApp → Settings → Linked devices → Link a device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex min-h-[19rem] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6">
            {status.qr ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={status.qr} alt="WhatsApp QR code" className="size-60" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Open WhatsApp on your phone and scan this code.
                </p>
              </div>
            ) : isConnected ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-7" />
                </span>
                <div>
                  <p className="font-medium">WhatsApp is connected</p>
                  <p className="text-sm text-muted-foreground">
                    New messages will appear in your inbox automatically.
                  </p>
                </div>
                <Button variant="outline" render={<Link href="/inbox" />}>
                  Go to inbox
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Smartphone className="size-7" />
                </span>
                <div>
                  <p className="font-medium">No QR code yet</p>
                  <p className="text-sm text-muted-foreground">
                    {status.status === "connecting"
                      ? "Connecting to WhatsApp…"
                      : "Start the session to generate a QR code."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(error || status.error) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error || status.error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={start} disabled={isBusy || isConnected}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
              {loading ? "Starting…" : status.qr ? "Refresh QR" : "Start & show QR"}
            </Button>
            {showReset && (
              <Button variant="outline" onClick={reset} disabled={resetting}>
                {resetting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Reset session
              </Button>
            )}
          </div>

          <div className="grid gap-3 rounded-xl bg-muted/30 p-4 text-sm sm:grid-cols-3">
            {[
              "Open WhatsApp on your phone",
              "Go to Linked devices → Link a device",
              "Point your camera at the QR code",
            ].map((step, index) => (
              <div key={step} className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium ring-1 ring-border">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
