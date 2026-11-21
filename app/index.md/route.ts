import { SITE } from "@/lib/site";

const markdown = `# ${SITE.name}

${SITE.description}

Studio Pro builds websites and business systems for companies in ${SITE.locality}, ${SITE.region} and across Malaysia. The WhatsApp assistant product turns a business WhatsApp number into an AI-supported sales channel.

## What it does

- Unified inbox for every WhatsApp conversation, with unread counts and full history.
- AI auto-replies in the customer's language, available 24/7.
- One-click human handoff, with the option to hand a thread back to the bot.
- Private by design: your own WhatsApp session and database, not routed through a third party.

## Company

- Name: ${SITE.legalName}
- Location: ${SITE.locality}, ${SITE.region}, ${SITE.country}
- Website: ${SITE.parentSite}
- Email: ${SITE.email}
- Telephone: ${SITE.phone}

## Links

- [Overview](${SITE.origin}/)
- [About](${SITE.origin}/about)
- [Contact](${SITE.origin}/contact)
- [Terms](${SITE.origin}/terms)
- [Privacy](${SITE.origin}/privacy)
- [Knowledge](${SITE.origin}/knowledge)
- [Connect WhatsApp](${SITE.origin}/connect)
- [Sitemap](${SITE.origin}/sitemap.xml)
- [llms.txt](${SITE.origin}/llms.txt)
`;

export function GET() {
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
