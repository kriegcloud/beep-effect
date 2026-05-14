# OPIP Web Launch Specification

## Status

**IMPLEMENTATION COMPLETE; LAUNCH REVIEW PENDING**

## Mission

Move the OPIP solo-practice website into `@beep/opip-web` as a build-ready,
repo-native public site for Thomas J. Oppold's intellectual property law
practice.

The v1 launch is a single-page public website. It is not the first AI-native
intake surface, not a deployment automation packet, and not a new slice package.

This status means the repo migration is ready to merge after the package proof
lane passes. It does not mean the site is approved for public launch.

## Non-Negotiable Contract

- The first milestone is a faithful refactor of the Claude-designed prototype,
  not a blank-page redesign.
- `apps/opip-web` owns v1 marketing-site copy, section data, SEO inputs,
  JSON-LD inputs, and launch review notes.
- `@beep/ui` remains the product-agnostic UI foundation. OPIP-specific
  sections stay app-local unless reuse proves otherwise.
- No new `@beep/law-practice-ui` package is created for v1.
- `@beep/law-practice-domain` is not expanded to model static marketing copy.
- Runtime assets required by the public site live under
  `apps/opip-web/public/opip/*`.
- Research docs, PDFs, source notes, and prototype deployment automation stay
  outside the app unless a later phase explicitly promotes them.
- Public claims are review-gated before launch:
  - client logos
  - named-client language
  - selected matters
  - press blurbs
  - bar/USPTO credentials
  - contact details
  - disclaimers
- V1 route shape is a single page with anchor navigation.
- V1 does not include fake AI widgets, placeholder prior-art tools, or
  nonfunctional intake products.
- V1 is build-ready only. Tailnet, standalone, static export, or production
  deploy automation are follow-up decisions.
- Public launch remains blocked on the review gates in this document and the
  app-local content module.

## Architecture Fit

- Product-specific browser presentation lives in the app-local UI surface for
  this launch.
- Product-agnostic primitives, Tailwind globals, Base UI/shadcn components,
  themes, and MUI compatibility stay in `foundation/ui-system` via `@beep/ui`.
- App-local content contracts use Effect Schema because the public copy and
  launch claims are reviewed data, not incidental component constants.
- The app stays on the repo-owned Next config and portless flow.

## Agent Enablement

The implementation should ensure shadcn affordances for future agents:

- Add the shadcn MCP server to global Codex config and repo-local Codex config.
- Keep the repo-local shadcn skill enabled through `.codex/config.toml`.
- Ensure a global Codex shadcn skill install exists or document the required
  restart/installation step.
- Do not change Claude Code `.mcp.json` in v1 unless a later phase asks for
  Claude parity.

Canonical Codex MCP entry:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

## Acceptance Criteria

- `@beep/opip-web` renders the OPIP home page instead of the starter page.
- The page includes About, Practice, Matters, Press, Clients, Contact, footer,
  legal notices, SEO metadata, web manifest, and JSON-LD.
- Static content decodes through app-local Effect Schema tests.
- Launch-risk content has explicit review status in the content module or
  initiative checklist.
- Runtime assets are copied into `apps/opip-web/public/opip/*`.
- Package checks pass:
  - `bun run --cwd apps/opip-web build`
  - `bun run --cwd apps/opip-web check`
  - `bun run --cwd apps/opip-web test`
  - `bun run --cwd apps/opip-web lint`
  - `bun run --cwd apps/opip-web type-test`
- Desktop and mobile browser smoke screenshots show the page rendering with
  media, anchors, and readable layout.
