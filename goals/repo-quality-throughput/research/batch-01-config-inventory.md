# Batch 1: Config Inventory

## Measured Facts

- Root orchestration files include `package.json`, `turbo.json`, `biome.jsonc`,
  ESLint config, root TypeScript configs, Vitest configs, Tstyche, Knip,
  syncpack, cspell, gitleaks ignore, Semgrep ignore, OSV scanner, Nix,
  Lefthook, Changesets, and GitHub workflows/actions.
- Package-local inventory included 92 `package.json`, 100 `tsconfig.json`, 89
  `vitest.config.ts`, 82 `docgen.json`, 15 `tsconfig.test.json`, 3 Vite
  configs, 2 Next configs, 1 Vercel config, and Storybook config.
- Root quality scripts route through repo tooling.

## Source-Backed Observations

- Biome uses Git ignore integration and broad generated/output excludes.
- ESLint delegates to repo config packs and runs as a lint sidecar.
- TypeScript/tsgo, Tstyche, Vitest, Knip, syncpack, cspell, security, Nix,
  hooks, docgen, generated metadata, apps, release, data-sync, Storybook, and
  Vercel all have possible quality-throughput impact.
- Config-sync owns several generated config surfaces; generated metadata should
  be updated through commands, not hand-edited.

## Duplicate Or Stale Findings Avoided

- Did not re-file Turbo credential hash pollution.
- Did not re-file initial lint sidecar grouping.
- Did not hand-edit generated metadata.

## Candidate Tasks

| Rank | Task | Expected Impact | Risk | Proof |
| ---: | --- | --- | --- | --- |
| 1 | Add CI setup/cache/install timing and A/B evidence. | High | Medium | Comparable CI runs. |
| 2 | Unify or instrument PR docgen affected planning with `docgen:local`. | High | Medium | Local plan, dry-run, GH docgen job. |
| 3 | Split/time repo-sanity and metadata sidecars. | Medium | Medium | Focused repo-sanity timings and quality proof. |
| 4 | Classify coverage and side workflows. | Medium | Medium | Coverage decision and side-workflow timing proof. |

## Do Not Do

- Do not hand-edit generated config metadata.
- Do not optimize Check workflow and forget release, data-sync, Storybook, or
  Vercel.

## Open Questions

- `Quality.command.ts` references `.gitleaks.toml`, but the inventory found
  `.gitleaksignore` and no `.gitleaks.toml`. Is that stale wiring or intentional
  default-config behavior?
- Which generated metadata files may drift before pre-push blocks them?
