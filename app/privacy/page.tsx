import { pageMetadata, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy — Studio Pro WhatsApp",
  description: "Privacy information for the Studio Pro WhatsApp assistant website.",
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-4 text-muted-foreground">
        {SITE.legalName} operates this site from {SITE.locality}, {SITE.region}, {SITE.country}. The public pages here do not ask you to submit personal information.
      </p>
      <h2 className="mt-8 text-xl font-semibold">CRM data</h2>
      <p className="mt-2 text-muted-foreground">
        WhatsApp conversations handled by the CRM are stored in the operator’s own database and session. Access requires an authorised admin sign-in. We do not sell conversation data.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 text-muted-foreground">
        Privacy questions can be sent to{" "}
        <a className="underline-offset-4 hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </p>
    </article>
  );
}
