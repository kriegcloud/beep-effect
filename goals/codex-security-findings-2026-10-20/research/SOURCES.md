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
  `https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings`, captured on 2026-10-20
  through a supported connector or the operator's signed-in in-app browser.
- The UI's signed-in `More finding actions → Export CSV` control supplied the 8-record
  batch. `beep codex findings ingest` normalized it; the export itself was never
  copied into the repository.

## Notes

- All eight full finding details were read from the authenticated in-app browser
  on 2026-10-20, including Validation, Evidence, and Attack-path analysis.
  Private captures are ignored in `raw/CSF-NNN-cloud-detail.txt`; signed artifact
  links are omitted. No artifact download or cloud status mutation was performed.
- Installed and reference Effect HTTP tracing sources establish opt-in header
  capture and the custom-header redaction gap; this is source evidence, with
  the synthetic runtime regression still held until PR #1928 merges.
- Tracked CSF files intentionally omit signed artifact URLs, raw developer-local
  paths, author email addresses, auth values, and unsanitized report text.

## Hub proxy compatibility references

- [Tailscale Serve documentation](https://tailscale.com/docs/features/tailscale-serve)
  describes the reverse proxy and injected identity headers.
- [Tailscale Serve implementation](https://github.com/tailscale/tailscale/blob/main/ipn/ipnlocal/serve.go)
  was inspected on 2026-10-20: reverseProxy.ServeHTTP uses the standard Go HTTP
  reverse proxy and rewrites forwarding/identity headers. The inspected rewrite
  does not remove Authorization. Credential forwarding is a source-derived
  inference; a deployed Tailscale forwarding test has not run under this hold.
