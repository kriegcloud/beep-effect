These fixtures preserve the native event and token-counter shapes observed in
bounded subscription transport probes. They retain numeric usage, tool event
kinds and scoped tool names. Prompts, responses, arguments, session identifiers,
authentication data, paths and tool output content have been removed.

Codex `turn.completed` values are additive and include cached input. Claude
`result` and Grok `end` values are terminal cumulative totals whose input field
excludes cached input. A zero explicitly present in a native field remains an
observed zero; an absent field remains unknown. The fixtures do not establish
complete child-agent usage or shell/skill graph-tool adoption.

Raw probe receipts remain outside the public repository in the operator-owned
readiness staging directory. The tests use these sanitized event fragments and
synthetic edge cases; they never invoke a model or an indexer.
