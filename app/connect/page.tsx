"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/whatsapp/start", { cache: "no-store" });
    const data = await res.json();
    setStatus(data);
  };

  const start = async () => {
    setLoading(true);
    await fetch("/api/whatsapp/start", { method: "POST" });
    await load();
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>Status: <span className="font-mono">{status?.status || "disconnected"}</span></div>
          {status?.status === "connected" && <div className="text-green-600">✅ WhatsApp Connected</div>}
          <Button onClick={start} disabled={loading || status?.status === "connected"}>
            {status?.status === "connected" ? "Connected" : loading ? "Starting..." : "Start & Show QR"}
          </Button>
          {status?.qr && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">Scan with WhatsApp → Linked Devices</p>
              <img src={status.qr} alt="QR Code" className="w-64 h-64 border rounded" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
