import { pageMetadata, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/about",
  title: "About — Studio Pro WhatsApp",
  description: `Learn about ${SITE.legalName}, the ${SITE.locality} studio behind this WhatsApp assistant.`,
});

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About Studio Pro</h1>
      <p className="mt-4 text-muted-foreground">
        Studio Pro is a web design and software studio based in {SITE.locality}, {SITE.region}, {SITE.country}. We build fast, practical websites and business systems for small and mid-sized organisations.
      </p>
      <p className="mt-4 text-muted-foreground">
        This WhatsApp assistant is part of that work. It connects a business WhatsApp number to an AI agent, gives the team one shared inbox and keeps a human in control of every conversation.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 text-muted-foreground">
        <a className="underline-offset-4 hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        {" · "}
        <a className="underline-offset-4 hover:underline" href={`tel:${SITE.phone}`}>
          {SITE.phoneDisplay}
        </a>
      </p>
    </article>
  );
}
