import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

const description =
  `${SITE.name} is an AI-powered WhatsApp assistant by ${SITE.legalName}. ` +
  `It provides AI auto-replies, a unified inbox and one-click human handoff. ` +
  `Contact: ${SITE.email}, ${SITE.phone}.`;

function rpcError(id: unknown, code: number, message: string, status = 200) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message } },
    { status },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    jsonrpc?: string;
    id?: unknown;
    method?: string;
  };

  if (body.jsonrpc !== "2.0" || !body.method) {
    return rpcError(body.id, -32600, "Invalid Request");
  }

  if (body.method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id ?? null,
      result: {
        protocolVersion: "2025-06-18",
        serverInfo: { name: "studio-pro-whatsapp", version: "1.0.0" },
        capabilities: { tools: { listChanged: false } },
      },
    });
  }

  if (body.method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id ?? null,
      result: {
        tools: [
          {
            name: "describe_studio_pro_whatsapp",
            description: "Describe the Studio Pro WhatsApp assistant and how to contact Studio Pro.",
            inputSchema: { type: "object", properties: {} },
          },
        ],
      },
    });
  }

  if (body.method === "tools/call") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id ?? null,
      result: { content: [{ type: "text", text: description }] },
    });
  }

  return rpcError(body.id, -32601, "Method not found", 404);
}

export function GET() {
  return NextResponse.json({
    name: "studio-pro-whatsapp",
    transport: "streamable-http",
    endpoint: "/mcp",
    documentation: `${SITE.origin}/llms.txt`,
  });
}
