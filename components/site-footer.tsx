import Link from "next/link";
import { SITE } from "@/lib/site";
import { LogoutButton } from "./logout-button";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-1">
          <p className="font-medium">{SITE.legalName}</p>
          <p className="text-muted-foreground">
            Web design &amp; development in {SITE.locality}, {SITE.region}.
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
            <a className="underline-offset-4 hover:underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <a className="underline-offset-4 hover:underline" href={`tel:${SITE.phone}`}>
              {SITE.phoneDisplay}
            </a>
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
          <Link className="underline-offset-4 hover:underline" href="/about">
            About
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/contact">
            Contact
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/terms">
            Terms
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/privacy">
            Privacy
          </Link>
          <LogoutButton />
        </nav>
      </div>
    </footer>
  );
}
