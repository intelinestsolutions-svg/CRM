"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();
    setSettings(data);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bot Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Welcome Message (First Message)</label>
            <Textarea
              value={settings.welcomeMessage || ""}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Sent automatically on first message from a new contact when bot is active.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoReplyFirstMessage !== "false"}
              onChange={(e) => setSettings({ ...settings, autoReplyFirstMessage: e.target.checked ? "true" : "false" })}
            />
            <label className="text-sm">Auto-reply to first message with welcome message</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.botEnabled !== "false"}
              onChange={(e) => setSettings({ ...settings, botEnabled: e.target.checked ? "true" : "false" })}
            />
            <label className="text-sm">Enable bot auto-reply</label>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
