import { pageMetadata, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/contact",
  title: "Contact — Studio Pro WhatsApp",
  description: `Contact ${SITE.legalName} in ${SITE.locality}, ${SITE.region} by email or phone.`,
});

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contact Studio Pro</h1>
      <p className="mt-4 text-muted-foreground">
        Questions about the WhatsApp assistant, web design or a Care Plan? Get in touch.
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 p-5">
          <dt className="text-sm font-medium">Email</dt>
          <dd className="mt-1 text-muted-foreground">
            <a className="underline-offset-4 hover:underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </dd>
        </div>
        <div className="rounded-2xl border border-border/60 p-5">
          <dt className="text-sm font-medium">Phone / WhatsApp</dt>
          <dd className="mt-1 text-muted-foreground">
            <a className="underline-offset-4 hover:underline" href={`tel:${SITE.phone}`}>
              {SITE.phoneDisplay}
            </a>
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">
        {SITE.locality}, {SITE.region}, {SITE.country}. Replies within one working day.
      </p>
    </article>
  );
}
