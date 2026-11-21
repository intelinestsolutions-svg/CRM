import { pageMetadata, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/terms",
  title: "Terms — Studio Pro WhatsApp",
  description: "Terms of use for the Studio Pro WhatsApp assistant website.",
});

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of use</h1>
      <p className="mt-4 text-muted-foreground">
        This site is operated by {SITE.legalName} in {SITE.locality}, {SITE.region}, {SITE.country}. The information here describes the Studio Pro WhatsApp assistant and is provided for general information.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Use of this site</h2>
      <p className="mt-2 text-muted-foreground">
        You may read and link to these pages. Access to the CRM dashboard and APIs is restricted to authorised users. Do not attempt to bypass authentication or interfere with the service.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 text-muted-foreground">
        Questions about these terms can be sent to{" "}
        <a className="underline-offset-4 hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </p>
    </article>
  );
}
