# Summary
- The Agent Rules repo reinforces a single-root `AGENTS.md` as the canonical instruction surface, expecting simple natural-language bullet rules and not requiring extra metadata so every tool can read the same source without complex parsing.
- The standard deliberately keeps instructions minimal and tool-agnostic while documenting how to tie tool-specific configs (Aider, Claude, Gemini, etc.) back to the canonical file so that generated behavior stays consistent across toolchains.
- Layering support (project root + current working directory) plus explicit guidance on plain-text readability make it easy to spot drift and to respect local overrides inside nested workspaces.

# Key Patterns to Reuse
- **Canonicalization:** Centralize rules in a root-level `AGENTS.md` (with optional per-directory copies) that agents read as natural-language bullets; avoid extra metadata so the file stays readable, diffable, and tool-agnostic.
- **Multi-tool generation:** Teach tooling to read from the canonical file (the README lists Aider, AMP, Factory AI, Copilot, Gemini, Kilo, Codex, Opencode, Phoenix, Roo Code, Zed) and supplement this with symlinks for tools that expect another filename (e.g., `ln -s AGENTS.md CLAUDE.md`).
- **Ownership model:** Treat the root `AGENTS.md` as the single source of truth and keep it simple/flat to reduce cognitive load for maintainers and to discourage multiple competing config structures.
- **Precedence/merge:** Respect the hierarchy the spec describes—include root-level instructions first, then merge in working-directory-specific files so nested packages can append context without breaking the root story.
- **Monorepo/nested behavior:** Provide sandboxed overrides by placing extra AGENTS files inside subprojects; the spec encourages agents to include both the root file and any local file in their context, which mirrors how a monorepo should layer guidelines for each package.
- **Drift-detection UX:** Keep the canonical instructions short, imperative, and bulletized, and have every tool reference that same file (via direct reads or symlinks) so any change affects every agent; this makes diffs obvious and avoids tool-specific drift.

# Risks/Anti-patterns
- **Multi-file proliferation:** Adding structured metadata, multiple AGENTS-like files, or translating to proprietary formats would defeat the spec’s “read as text” rule and introduce divergence that agents might handle inconsistently.
- **Tool-specific siloing:** Letting one tool maintain its own instructions (e.g., a Claude-only `CLAUDE.md` that diverges from `AGENTS.md`) risks conflicting behavior unless synced via symlinks or repeated edits.
- **Ignoring local context:** Not loading working-directory AGENTS files inside nested packages would prevent local teams from steering automation for their slice of the repo, so obey the merge-in rule to avoid stale guidance.
- **Complex formatting:** Using structured markup, multiple headings, or syntactic sugar in the canonical file makes drift harder to detect; stick to flat bullet statements so git diffs remain clean and obvious.

# Concrete Recommendations for beep-sync
- Store beep-sync’s instruction set in one root-level file (e.g., `AGENTS.md`) formatted as bulletized imperative rules, and ensure the repo’s toolchain reads that file first when generating prompts.
- When beep-sync targets multiple agents, configure each tool to read the canonical file (explicit config for Aider, Gemini, etc.) and provide scripted symlinks or copy steps so legacy tool filenames point back to the root set.
- Support repo nesting by having per-package AGENTS (or canonical fragments) that beep-sync merges after the root instructions so local overrides apply only inside their subtrees.
- Highlight the canonical file in beep-sync’s docs and CI checks so maintainers recognize it as the single source; the simpler and shorter it stays, the easier drift detection and multi-tool parity will be.
- Avoid introducing rich metadata or separate rule sources; any additional constraints should go in the shared AGENTS file so beep-sync’s agents stay aligned without manual reconciliation.
