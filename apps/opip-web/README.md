# @beep/opip-web

Next.js 16 canary app for the OPIP public law-firm site, wired to the shared
`@beep/ui` shadcn/Tailwind setup.

## Development

```bash
# Shared portless URL
bun run dev

# Raw Next dev server
bun run dev:raw

# Turbopack production build
bun run build

# Webpack PWA build
bun run build:pwa
```

## Dev URL

`bun run dev` serves the app at `https://opip-web.localhost:1355`.

## Launch Initiative

The launch packet lives at `../../initiatives/opip-web-launch`.

V1 is a single-page, build-ready public site. Public claims, client marks,
selected matters, contact details, and disclaimers remain review-gated before
publishing.
