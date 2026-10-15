# Sources

## Repo Sources

- `AGENTS.md` / `CLAUDE.md` - repository law and tool routing.
- `goals/README.md` - packet standard and completion gate.
- `goals/codex-security-findings-2026-08-04/**` - prior packet structure,
  sanitation, triage, and post-merge closure precedent.
- `standards/ARCHITECTURE.md` and `standards/architecture/**` - ownership and
  shared-kernel doctrine.
- Live source and package barrels named by each finding - current-HEAD truth.
- `packages/tooling/tool/cli/src/internal/repo-run/DirectoryHandle.ts` -
  existing no-follow, descriptor-bound directory operations reused by CSF-001.
- `packages/tooling/tool/cli/src/commands/Reviewer/ReviewerService.ts` and
  `ReviewerRuleset.ts` - current-HEAD L0/check/gate behavior for CSF-002.

## External Source

- Codex Security Cloud MCP app:
  `https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings`, captured on 2026-10-14
  through a supported connector or the operator's signed-in in-app browser.
- The UI's signed-in `More finding actions → Export CSV` control supplied the 2-record
  batch. `beep codex findings ingest` normalized it; the export itself was never
  copied into the repository.

## Notes

- `raw/` holds captured summaries only. Signed-in finding details for both
  exact Codex IDs supplied Validation, Evidence, and Attack-path analysis before
  triage; the CSF records retain sanitized conclusions and explicit proof gaps.
- Tracked CSF files intentionally omit signed artifact URLs, raw developer-local
  paths, author email addresses, auth values, and unsanitized report text.
