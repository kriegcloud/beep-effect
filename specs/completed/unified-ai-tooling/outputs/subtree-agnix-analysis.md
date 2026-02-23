# Subtree Agnix Analysis

## Summary
- agnix is a 230-rule agent-config linter spanning skills, hooks, memory, AGENTS, MCP, XML, Copilot, Cursor, Codex, and other surfaces, so it already covers the kinds of linting layers beep-sync needs to coordinate (`.repos/agnix/SPEC.md:6`).
- The validation pipeline walks directories, resolves file types via overrides, normalizes line endings, validates in parallel, and sorts diagnostics by severity+path before emitting them, which keeps the UX deterministic even on large trees (`.repos/agnix/SPEC.md:64`).
- Diagnostics are surfaced through `agnix-lsp` so editors show real-time warnings/errors, matching the CLI output described in the configuration guide; that same guide documents JSON/SARIF exports and `--show-fixes` previews that feed downstream tooling (`.repos/agnix/docs/EDITOR-SETUP.md:3`, `.repos/agnix/docs/CONFIGURATION.md:150`).

## Key Patterns to Reuse
- Guardrails come from a rules-config matrix where every rule category (skills, hooks, memory, agents, etc.) can be toggled, tools can be scoped per CLI target, and warnings level/locale are configurable via the shared `.agnix.toml` schema (`.repos/agnix/docs/CONFIGURATION.md:36`, `.repos/agnix/SPEC.md:201`).
- Schema-driven config means users can regenerate the JSON Schema from Rust types, drop it into `schemas/agnix.json`, and get editor autocomplete plus pre-validation warnings for invalid rule IDs/tools/globs before the main scan runs (`.repos/agnix/docs/CONFIGURATION.md:88`, `.repos/agnix/schemas/README.md:1`).
- Diagnostics remain consistent because the core pipeline normalizes inputs, exposes structured JSON/SARIF output, and LSP clients reuse the same engine, which lets a single fix request map to the same underlying rule hits regardless of surface (`.repos/agnix/SPEC.md:64`, `.repos/agnix/docs/CONFIGURATION.md:150`, `.repos/agnix/docs/EDITOR-SETUP.md:3`).
- Autofix capabilities are tiered: the CLI offers `--fix`, `--fix-safe`, `--fix-unsafe`, `--show-fixes`, and `--dry-run`, while the knowledge-base catalog only marks high-certainty patterns as auto-fixable and keeps medium/low-level diagnostics warning-only (`.repos/agnix/SPEC.md:182`, `.repos/agnix/knowledge-base/PATTERNS-CATALOG.md:5`).
- The GitHub Action orchestrates download→run→annotation flows and re-runs in SARIF mode while the helper scripts sanitize workflow values, parse JSON, emit `::error` annotations, and re-run for SARIF output, which is reusable for beep-sync’s CI (`.repos/agnix/action.yml:1`, `.repos/agnix/scripts/run.sh:4`, `.repos/agnix/scripts/download.sh:4`).
- Dependency policy enforcement is baked in via `cargo-deny` (multi-version denial plus explicit allowlists) and `cargo-audit` (severity=low, deny unmaintained), so security checks can gate merges automatically (`.repos/agnix/deny.toml:1`, `.repos/agnix/audit.toml:1`).

## Risks/Anti-patterns
- The real-world testing guide warns about HTML/mention/regex false positives and lists common false negatives (role-play instructions, regex hooks, Cursor files, etc.), showing that breadth invites noise and justifies keeping a false-positive budget (~3%) while tuning rules (`.repos/agnix/docs/REAL-WORLD-TESTING.md:112`).
- Autofix is only safe for patterns that exceed 95% certainty; medium-certainty rules should stay warning-only unless the user explicitly opts in because the catalog treats LOW patterns as verbose-only (`.repos/agnix/knowledge-base/PATTERNS-CATALOG.md:15`).

## Concrete Recommendations for beep-sync
1. Adopt a schema-driven `.beep-sync.toml` (or similar) with `tools`, `rules`, `severity`, and `[files]` overrides so multi-tool projects can toggle categories like skills/hooks/memory; reuse the `agnix schema` workflow for linting configs before they run (`.repos/agnix/docs/CONFIGURATION.md:36`, `.repos/agnix/schemas/README.md:1`).
2. Mirror agnix’s normalize→parallel validate→sort pipeline so diagnostics stay deterministic and support cross-file checks (AGM-006, XP-004/005/006) when beep-sync needs to reason about AGENTS vs CLAUDE vs CLI domains (`.repos/agnix/SPEC.md:64`).
3. Surface diagnostics both in CLI (JSON/SARIF plus `--show-fixes`) and through an LSP/IDE helper so devs get instant feedback and the same formatter powers CI consumers (`.repos/agnix/docs/CONFIGURATION.md:150`, `.repos/agnix/docs/EDITOR-SETUP.md:3`).
4. Provide tiered autofix options (`fix`, `fix-safe`, `fix-unsafe`) and only enable fixes for high-certainty patterns; medium/low warnings should respect a `--fix-safe` gate just like agnix does (`.repos/agnix/SPEC.md:182`, `.repos/agnix/knowledge-base/PATTERNS-CATALOG.md:5`).
5. Reuse the download→run helper scripts pattern to keep GitHub annotations safe (sanitize workflow output, parse JSON, emit SARIF) so the CI action can fail on errors or simply report numbers like agnix does (`.repos/agnix/action.yml:1`, `.repos/agnix/scripts/run.sh:4`, `.repos/agnix/scripts/download.sh:4`).
6. Layer in dependency/policy guards via cargo-deny and cargo-audit equivalents so beep-sync can reject insecure dependencies before merges (`.repos/agnix/deny.toml:1`, `.repos/agnix/audit.toml:1`).
