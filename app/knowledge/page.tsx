"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Loader2,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Entry = {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  createdAt: string;
};

export default function KnowledgePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge", { cache: "no-store" });
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      toast.error("Could not load knowledge base.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Enter a title or content.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      if (!res.ok) throw new Error("add failed");
      setTitle("");
      setContent("");
      await load();
      toast.success("Knowledge added");
    } catch {
      toast.error("Could not add knowledge.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (entry: Entry) => {
    try {
      await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, enabled: !entry.enabled }),
      });
      await load();
    } catch {
      toast.error("Could not update entry.");
    }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      await load();
      toast.success("Knowledge removed");
    } catch {
      toast.error("Could not remove entry.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BookOpen className="size-5 text-emerald-600 dark:text-emerald-400" />
          Knowledge base
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add facts, FAQs, and policies the AI uses when replying to customers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add knowledge</CardTitle>
          <CardDescription>
            Entries are injected into every AI reply while enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Payment policy)"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Content the AI should know (e.g. We require a 50% upfront deposit before starting work.)"
          />
          <div className="flex justify-end">
            <Button onClick={add} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {saving ? "Adding…" : "Add knowledge"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
          <CardDescription>{entries.length} total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No knowledge yet. Add your first entry above.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "rounded-xl border border-border/60 p-4 transition-opacity",
                  !entry.enabled && "opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{entry.title}</p>
                      <Badge variant="outline" className={entry.enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ""}>
                        {entry.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {entry.content && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {entry.content}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => toggle(entry)}
                      aria-label={entry.enabled ? "Disable" : "Enable"}
                    >
                      <Power className={cn("size-4", entry.enabled && "text-emerald-600 dark:text-emerald-400")} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(entry.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
