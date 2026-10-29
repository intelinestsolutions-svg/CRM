"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Bot,
  Inbox as InboxIcon,
  Loader2,
  MessageSquareText,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  mode: string;
  unreadCount?: number;
  lastMessageAt?: string | null;
  contact?: { name?: string | null; waId?: string | null } | null;
  messages?: { body?: string | null }[];
};

type Message = {
  id: string;
  direction: string;
  body?: string | null;
  sentBy?: string | null;
  timestamp?: string;
};

function displayName(contact: Conversation["contact"]) {
  return contact?.name?.trim() || (contact?.waId ? `+${contact.waId}` : "Unknown contact");
}

function initials(contact: Conversation["contact"]) {
  const name = contact?.name?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return contact?.waId?.slice(-2) ?? "?";
}

export default function InboxPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const loadConvs = useCallback(async () => {
    try {
      const res = await fetch("/api/inbox", { cache: "no-store" });
      const data = await res.json();
      setConvs(data.conversations || []);
    } catch {
      // keep the previous list on a transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/inbox/id?id=${id}`, { cache: "no-store" });
      const data = await res.json();
      setActive(data.conversation);
      setMessages(data.messages || []);
    } catch {
      // ignore transient failures
    }
  }, []);

  useEffect(() => {
    loadConvs();
    const timer = setInterval(loadConvs, 3000);
    return () => clearInterval(timer);
  }, [loadConvs]);

  useEffect(() => {
    if (!activeId) return;
    loadThread(activeId);
    const timer = setInterval(() => loadThread(activeId), 3000);
    return () => clearInterval(timer);
  }, [activeId, loadThread]);

  useEffect(() => {
    if (messages.length !== lastCountRef.current) {
      lastCountRef.current = messages.length;
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return convs;
    return convs.filter((c) => {
      const name = displayName(c.contact).toLowerCase();
      const last = c.messages?.[0]?.body?.toLowerCase() ?? "";
      return name.includes(q) || last.includes(q);
    });
  }, [convs, query]);

  const openConversation = (id: string) => {
    lastCountRef.current = 0;
    setActiveId(id);
  };

  const send = async () => {
    const body = text.trim();
    if (!active || !body || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active.id, text: body }),
      });
      if (!res.ok) throw new Error("send failed");
      setText("");
      await loadThread(active.id);
      await loadConvs();
    } catch {
      toast.error("Message could not be sent. Is WhatsApp connected?");
    } finally {
      setSending(false);
    }
  };

  const toggleMode = async () => {
    if (!active) return;
    const mode = active.mode === "bot" ? "human" : "bot";
    try {
      const res = await fetch("/api/conversations/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active.id, mode }),
      });
      if (!res.ok) throw new Error("toggle failed");
      await loadThread(active.id);
      await loadConvs();
      toast.success(mode === "human" ? "You took over this chat" : "Bot re-enabled for this chat");
    } catch {
      toast.error("Could not change the conversation mode.");
    }
  };

  return (
    <div className="mx-auto grid h-[calc(100dvh-3.5rem)] w-full max-w-6xl grid-cols-1 overflow-hidden md:grid-cols-[21rem_1fr]">
      <aside className="flex min-h-0 flex-col border-r border-border/60">
        <div className="space-y-3 border-b border-border/60 p-4">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-2 font-semibold">
              <InboxIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              Inbox
            </h1>
            <Badge variant="secondary">{convs.length}</Badge>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations…"
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <MessageSquareText className="size-6" />
              {query ? "No conversations match your search." : "No conversations yet."}
            </div>
          ) : (
            filtered.map((c) => {
              const last = c.messages?.[0]?.body;
              const unread = c.unreadCount ?? 0;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/40 p-3 text-left transition-colors hover:bg-muted/60",
                    activeId === c.id && "bg-muted",
                  )}
                >
                  <Avatar className="mt-0.5">
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      {initials(c.contact)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{displayName(c.contact)}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {c.lastMessageAt
                          ? formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: false })
                          : ""}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {last || "No messages yet"}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <Bot
                          className={cn(
                            "size-3",
                            c.mode === "bot" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50",
                          )}
                        />
                        {unread > 0 && (
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </aside>

      <section className="flex min-h-0 flex-col">
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b border-border/60 p-3 sm:p-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {initials(active.contact)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{displayName(active.contact)}</div>
                <div className="truncate text-xs text-muted-foreground">
                  +{active.contact?.waId}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  active.mode === "bot"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                )}
              >
                {active.mode === "bot" ? <Bot className="size-3" /> : <UserRound className="size-3" />}
                {active.mode === "bot" ? "Bot" : "Human"}
              </Badge>
              <Button size="sm" variant="outline" onClick={toggleMode}>
                {active.mode === "bot" ? "Take over" : "Give to bot"}
              </Button>
            </header>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-3 p-4">
                {messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No messages in this conversation yet.
                  </p>
                ) : (
                  messages.map((m) => {
                    const out = m.direction === "out";
                    return (
                      <div key={m.id} className={cn("flex", out ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%]",
                            out
                              ? "rounded-br-md bg-emerald-600 text-white"
                              : "rounded-bl-md bg-muted text-foreground",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <div
                            className={cn(
                              "mt-1 flex items-center gap-1.5 text-[10px]",
                              out ? "text-white/70" : "text-muted-foreground",
                            )}
                          >
                            {m.timestamp && <span>{format(new Date(m.timestamp), "HH:mm")}</span>}
                            {m.sentBy && <span className="capitalize">· {m.sentBy}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 p-3 sm:p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="h-10 flex-1"
                  autoComplete="off"
                />
                <Button type="submit" size="icon-lg" disabled={!text.trim() || sending} aria-label="Send message">
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MessageSquareText className="size-6" />
            </span>
            <div>
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm text-muted-foreground">
                Choose a chat on the left to read and reply.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
