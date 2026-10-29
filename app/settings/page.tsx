"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Loader2, Save, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Settings = Record<string, string>;

function Switch({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          checked ? "bg-emerald-500" : "bg-input",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => toast.error("Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("save failed");
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const botEnabled = settings.botEnabled !== "false";
  const autoReplyFirst = settings.autoReplyFirstMessage !== "false";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Settings2 className="size-5 text-emerald-600 dark:text-emerald-400" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control how your AI agent replies to customers.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading settings…
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-4" /> Bot behaviour
              </CardTitle>
              <CardDescription>
                These settings apply to every new conversation unless you take over manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Switch
                id="botEnabled"
                checked={botEnabled}
                onChange={(value) => setSettings({ ...settings, botEnabled: String(value) })}
                label="Enable bot auto-reply"
                description="When off, the bot stays silent and messages wait for a human."
              />
              <Switch
                id="autoReplyFirstMessage"
                checked={autoReplyFirst}
                onChange={(value) =>
                  setSettings({ ...settings, autoReplyFirstMessage: String(value) })
                }
                label="Send welcome message to new contacts"
                description="Greets a contact the first time they message you."
              />

              <div className="space-y-2 border-t border-border/60 pt-4">
                <label htmlFor="welcomeMessage" className="text-sm font-medium">
                  Welcome message
                </label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage || ""}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={4}
                  placeholder="Hi! Thanks for messaging us. How can I help you today?"
                />
                <p className="text-xs text-muted-foreground">
                  Sent automatically to new contacts when the bot is active.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Changes take effect on the next incoming message.
            </p>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" /> WhatsApp connection
              </CardTitle>
              <CardDescription>
                Manage the device linked to this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/connect" />}>
                Open connection page
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
