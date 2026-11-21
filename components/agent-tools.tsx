"use client";

import { useEffect } from "react";
import { SITE } from "@/lib/site";

type ModelContext = {
  registerTool?: (tool: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: () => Promise<{
      content: Array<{ type: "text"; text: string }>;
    }>;
  }) => void;
};

const summary =
  `${SITE.name} is an AI-powered WhatsApp assistant by ${SITE.legalName}, ` +
  `a web design and software studio in ${SITE.locality}, ${SITE.region}, ${SITE.country}. ` +
  "It provides AI auto-replies, a unified WhatsApp inbox and one-click human handoff. " +
  `Contact: ${SITE.email}, ${SITE.phone}.`;

export function AgentTools() {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!modelContext?.registerTool) return;

    modelContext.registerTool({
      name: "describe_studio_pro_whatsapp",
      description:
        "Describe the Studio Pro WhatsApp assistant, its features and how to contact the studio.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => ({ content: [{ type: "text", text: summary }] }),
    });
  }, []);

  return null;
}
