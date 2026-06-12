# Decisions

## 2026-06-12 — context alignment confirmed

**Question:** Does the assistant's summary of the stack and the brainstorm
intent match the author's mental model (before align-stage grilling begins)?

**Answer:** Yes — fully aligned.

**Rationale:** The confirmed framing, carried into all later stages:

1. The chat input is the control plane's **command surface** — schema-parsed
   blocks let the runtime deterministically route intent (prose vs artifact
   references vs slash commands vs approval actions), not just prettier text.
2. Editing a message = **thread branching**, which the Thread doctrine in
   `goals/agentic-professional-runtime/docs/data-model-shared-core.md`
   anticipates; Lexical's immutable EditorState is the natural substrate.
3. Blocks as Effect Schema tagged unions + annotations → per-model
   serialization (e.g. XML for Claude) via existing `@beep/schema` codecs.
4. Likely placement per repo law: generic editor/chat kit extends `@beep/ui`
   editor blocks; Thread/Turn schemas land in the workspace domain; desktop
   wiring follows the existing Atom + SDK-contract patterns.

Align-stage grilling has not started; open questions live in
[`ops/manifest.json`](./ops/manifest.json).
