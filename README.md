# Studio Pro WhatsApp CRM

Next.js app for `crm.prostudio.my`.

## Admin sign-in

The whole site is protected by an env-based email/password login. No password is stored in the code.

Generate credentials:

```bash
npm run admin:hash -- --generate
```

The command prints a one-time admin password plus `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`. Add those values in **hPanel → Node.js → Environment Variables**, along with `ADMIN_EMAIL=admin@prostudio.my`, then restart/redeploy. Locally, put them in `.env.local` (gitignored).

Rate limiting is 5 failed attempts per IP per 15 minutes.

## Agent visibility

The app now serves:

- `/robots.txt` with `Content-Signal: search=yes, ai-train=no` and the sitemap
- `/sitemap.xml`
- `/llms.txt`
- `/index.md` (also returned for `/` when `Accept: text/markdown`)
- `/.well-known/mcp/server-card.json` and a minimal `/mcp` endpoint
- JSON-LD (`Organization`, `LocalBusiness`, `WebSite`, `SoftwareApplication`, `WebPage`, `BreadcrumbList`, `FAQPage`)
- About, contact, terms and privacy pages linked from the footer
- WebMCP tool registration via `navigator.modelContext.registerTool()`

By default `ADMIN_PUBLIC_DISCOVERY=false`, so unauthenticated visitors are redirected to `/login` and cannot see the public pages or discovery files. Set `ADMIN_PUBLIC_DISCOVERY=true` in hPanel if you want AI crawlers to read the discovery files while keeping the dashboard gated. This is the trade-off between “entire site gated” and the Hostinger AI visibility score.

## Local development

```bash
npm install
npm run dev
```

## Deploy

Hostinger deploys from the `main` branch via git. Push to `main`, then trigger a redeploy in hPanel if it does not auto-deploy.

Environment variables required in hPanel:

- `DATABASE_URL` (SQLite file path)
- `WHATSAPP_AUTH_DIR`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- optional `ADMIN_PUBLIC_DISCOVERY`

## Email

This app does not send email. Hostinger SMTP settings are not needed here. Use hPanel → Emails to create the mailbox for `crm.prostudio.my` and configure MX/SPF/DKIM/DMARC there.
