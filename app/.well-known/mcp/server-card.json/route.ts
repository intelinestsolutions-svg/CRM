import { SITE } from "@/lib/site";

export function GET() {
  return Response.json(
    {
      $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
      version: "1.0",
      protocolVersion: "2025-06-18",
      serverInfo: {
        name: "studio-pro-whatsapp",
        title: SITE.name,
        version: "1.0.0",
      },
      description: SITE.description,
      documentationUrl: `${SITE.origin}/llms.txt`,
      transport: {
        type: "streamable-http",
        endpoint: "/mcp",
      },
      capabilities: {
        tools: { listChanged: false },
        prompts: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
      },
      tools: ["describe_studio_pro_whatsapp"],
      instructions:
        "Call tools/list for available tools. The describe_studio_pro_whatsapp tool returns a short description of the product and contact details.",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
