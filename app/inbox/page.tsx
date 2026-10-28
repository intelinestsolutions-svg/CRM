"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function InboxPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const loadConvs = async () => {
    const res = await fetch("/api/inbox", { cache: "no-store" });
    const data = await res.json();
    setConvs(data.conversations || []);
  };

  const loadThread = async (id: string) => {
    const res = await fetch(`/api/inbox/id?id=${id}`, { cache: "no-store" });
    const data = await res.json();
    setActive(data.conversation);
    setMessages(data.messages || []);
  };

  useEffect(() => {
    loadConvs();
    const t = setInterval(loadConvs, 3000);
    return () => clearInterval(t);
  }, []);

  const send = async () => {
    if (!active || !text) return;
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: active.id, text }),
    });
    setText("");
    await loadThread(active.id);
    await loadConvs();
  };

  const toggleMode = async () => {
    if (!active) return;
    const mode = active.mode === "bot" ? "human" : "bot";
    await fetch("/api/conversations/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: active.id, mode }),
    });
    await loadThread(active.id);
    await loadConvs();
  };

  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-4 border-r">
        <div className="p-3 border-b font-semibold">Conversations</div>
        <ScrollArea className="h-[calc(100vh-50px)]">
          {convs.map((c) => (
            <button key={c.id} onClick={() => loadThread(c.id)} className={`w-full text-left p-3 border-b hover:bg-muted ${active?.id === c.id ? "bg-muted" : ""}`}>
              <div className="flex justify-between">
                <div className="font-medium">{c.contact?.name || c.contact?.waId}</div>
                <Badge variant={c.mode === "bot" ? "secondary" : "default"}>{c.mode}</Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate">{c.messages?.[0]?.body}</div>
            </button>
          ))}
        </ScrollArea>
      </div>
      <div className="col-span-8 flex flex-col">
        {active ? (
          <>
            <div className="p-3 border-b flex justify-between items-center">
              <div>
                <div className="font-semibold">{active.contact?.name || active.contact?.waId}</div>
                <div className="text-xs text-muted-foreground">+{active.contact?.waId}</div>
              </div>
              <Button size="sm" variant="outline" onClick={toggleMode}>{active.mode === "bot" ? "Take over (Human)" : "Give to Bot"}</Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-lg ${m.direction === "out" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                      <div className="text-[10px] opacity-70 mt-1">{m.sentBy || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && send()} />
              <Button onClick={send}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
