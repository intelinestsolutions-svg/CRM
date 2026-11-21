import { SITE } from "@/lib/site";

export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

Studio Pro is a web design and software studio based in ${SITE.locality}, ${SITE.region}, ${SITE.country}. This subdomain is the public home of its AI-powered WhatsApp assistant product.

## Pages

- [Overview](${SITE.origin}/): What the assistant does — AI auto-replies, unified inbox, human handoff, private by design.
- [About](${SITE.origin}/about): Who operates this service and where they are based.
- [Contact](${SITE.origin}/contact): Email and telephone contact details.
- [Terms](${SITE.origin}/terms): Terms of use.
- [Privacy](${SITE.origin}/privacy): Privacy information.
- [Knowledge](${SITE.origin}/knowledge): Public product knowledge base.
- [Connect WhatsApp](${SITE.origin}/connect): Start connecting a WhatsApp number.

## Contact

- Email: ${SITE.email}
- Telephone: ${SITE.phone}
- Location: ${SITE.locality}, ${SITE.region}, ${SITE.country}
- Studio website: ${SITE.parentSite}

## Machine-readable resources

- Sitemap: ${SITE.origin}/sitemap.xml
- Markdown homepage: ${SITE.origin}/index.md
- MCP server card: ${SITE.origin}/.well-known/mcp/server-card.json
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
