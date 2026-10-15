# Sources

## Repo Sources

- `AGENTS.md` / `CLAUDE.md` - repository law and tool routing.
- `goals/README.md` - packet standard and completion gate.
- `goals/codex-security-findings-2026-08-04/**` - prior packet structure,
  sanitation, triage, and post-merge closure precedent.
- `standards/ARCHITECTURE.md` and `standards/architecture/**` - ownership and
  shared-kernel doctrine.
- Live source and package barrels named by each finding - current-HEAD truth.

## External Source

- Codex Security Cloud MCP app:
  `https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings`, captured on 2026-10-14
  through a supported connector or the operator's signed-in in-app browser.
- The UI's signed-in `More finding actions → Export CSV` control supplied the 1-record
  batch. `beep codex findings ingest` normalized it; the export itself was never
  copied into the repository.
- The finding detail supplied Validation, Evidence, and Attack-path analysis for
  `commit:08744ebc989881918d74a6bac4e765a3` on the signed-in page.
- Installed `grok 1.0.58` and Claude Code `2.1.300` CLI help confirmed the
  available launcher flags. Vendor documentation explains Grok's separate
  [permission rules](https://docs.x.ai/build/features/permissions) and
  [sandbox profiles](https://docs.x.ai/build/features/sandbox).
- [PR #1795](https://github.com/beep-effect/beep-effect/pull/1795) records the
  final head, 5/5 reviewer summary, hosted checks, S11 gate, and merge at
  `5f3dfb396982d797c2a521d42fe5bf592f90be6c`.
- The signed-in finding detail showed the exact captured ID as Fixed after
  merge; the refreshed New/Triaged/In Progress view showed 0 of 0 findings.

## Notes

- `raw/` holds captured summaries only; Validation, Evidence, and Attack-path
  analysis require separate finding-detail enrichment before triage.
- Tracked CSF files intentionally omit signed artifact URLs, raw developer-local
  paths, author email addresses, auth values, and unsanitized report text.
