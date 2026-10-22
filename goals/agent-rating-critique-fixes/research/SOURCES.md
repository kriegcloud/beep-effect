# Agent Rating Critique Fixes — Sources & Provenance

- **Source exploration:** none. The packet was authored directly from a
  live repository audit run on 2026-10-21 at the operator's request
  ("rate this repository 1–10 … be thorough, specific"). The audit report
  is the primary source and is landed verbatim (link-rebased) as
  [`repository-rating.md`](./repository-rating.md), except the two review
  corrections its Disclosure records (PR #1996: the §10 Firecrawl row and
  the launch-failure note).

## 1. Mined source corpus

| Source | Title | Location | Theme | Disposition |
| --- | --- | --- | --- | --- |
| Audit 2026-10-21 | Repository Rating — beep-effect | `research/repository-rating.md` | 11-dimension scored baseline | Normative baseline for all phases |
| Workflow run | 8 parallel dimension auditors + critic + synthesis | session workflow (muse-wonder-1.0 children) | Evidence per dimension | §1–§9, §11 inputs; synthesis truncated (see Disclosure) |
| Orchestrator runs | `wc`/`rg`/`git ls-files` verification | quoted in rating §10–§11 | Maintainability, security | Directly verified scores |

## 2. Upstream repositories & licenses

None. No external code or text was taken.

## 3. External research sources

None. Every claim in the rating cites an in-repo path.

## 4. In-repo capability references

| Capability | Owner | Used for |
| --- | --- | --- |
| Goal packet bootstrap | `bun run beep goals bootstrap` | P0 packet materialisation (plan `goal-plan/v1:65816d…`) |
| Packet validation | `bun run beep goals doctor`, `goals index` | P0/P4 hygiene gates |
| PR delivery | `bun run beep yeet` (`.agents/skills/yeet/SKILL.md`) | Every phase PR to mergeable |
| Package proof | `bun run beep quality package-verify` | P1–P3 handoffs |
| Code-structure queries | `graft` (`.agents/skills/graft/SKILL.md`) | P3 split planning |

## 5. Cross-links & provenance

- Counting commands behind the baseline (re-run identically at P4):
  `rg` escape-hatch counts over `packages/**/src`; `wc -l` largest-file
  lists excluding `*generated*`/`*.gen.ts`; `git ls-files '*.md'`;
  `TODO|FIXME|HACK` scan; workflow/package/test file counts.
- The audit's first workflow launch failed because the `muse-wonder-1.0`
  session's catalog offered only the session model, so the current
  `claude-opus-5-5` child pin could not be served: an availability failure
  of the session catalog, recorded in the rating Disclosure and not counted
  as §1 stale-pin evidence.
- Friction ledger: none yet. Phase lanes append here when work is
  slower or riskier than it should be (redacted, minimal error text).
