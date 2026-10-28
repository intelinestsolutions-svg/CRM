import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">WACRM - WhatsApp CRM</h1>
      <p className="text-muted-foreground">Agentic chat powered by ai.prostudio.my</p>
      <div className="flex gap-2 flex-wrap justify-center">
        <Link href="/connect"><Button>Connect WhatsApp</Button></Link>
        <Link href="/inbox"><Button variant="outline">Inbox</Button></Link>
        <Link href="/settings"><Button variant="outline">Settings</Button></Link>
      </div>
    </main>
  );
}

