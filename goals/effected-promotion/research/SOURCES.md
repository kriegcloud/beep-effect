# Effected kit promotion — Sources & Provenance

- **Source exploration:** none — the packet continues the completed effected
  port (`scratchpad/EFFECTED_PORT_GOAL.md`, ledger `scratchpad/effected/PORT_LEDGER.json`).

## 1. Mined source corpus

| Source | Title | Upstream (repo) | Location (`file:line`) | Theme | Disposition |
|--------|-------|-----------------|------------------------|-------|-------------|
| Port lab | `scratchpad/effected/<module>` | spencerbeggs/effected | `scratchpad/effected/*/index.ts` | 28 promotable modules + the port runner | Promoted wave by wave (PLAN.md); runner retires last |
| Discovery map | Effected promotion map | — | `research/promotion-map-2026-10-20.md` | Package map, ceiling fixes, waves, reuse sites, markdown designs | Normative input to SPEC D-01..D-18 |
| Port reviews | Per-module review rounds | — | `history/port-reviews/<module>/` | Port review evidence | Archived, read-only |

## 2. Upstream repositories & licenses

| Repo | License | Port discipline | What we take |
|------|---------|-----------------|--------------|
| `spencerbeggs/effected` (`~/YeeBois/references/effect/effected`) | MIT (C. Spencer Beggs) | Ported verbatim then made beep-native (port goal D1-D18) | Source and tests of each module; every package `LICENSE` carries the upstream notice |

## 3. External research sources

- `effect@4.0.5` `effect/encoding/{Yaml,Toml,Ndjson}` (upstream-first census, SPEC D-12).

## 4. In-repo capability references

- `standards/ARCHITECTURE.md` (family grammar, ceilings, capability gate, upstream-first rule).
- `standards/architecture/07-non-slice-families.md`, `standards/architecture/DECISIONS.md`.
- `@beep/md` (`packages/foundation/modeling/md`) for the markdown merge (SPEC D-02).

## 5. Cross-links & provenance

- Port PRs: #1592, #1628, #1659, closeout #1662.
- `goals/effect-child-process-hardening/SPEC.md` exception row retired by SPEC D-03.
