---
action: context
tool: (Edit|Write)
event: PostToolUse
name: avoid-option-object-compaction-match
description: Avoid empty-object Option match compaction
glob: "**/*.{ts,tsx}"
pattern: (?:O|Option)\.match\([\s\S]{0,800}onNone:\s*\(\)\s*=>\s*\(\s*\{\s*\}\s*\)[\s\S]{0,800}onSome:\s*\([^)]*\)\s*=>\s*\(\s*\{
tag: avoid-option-object-compaction-match
level: warning
---

# Avoid `O.match(...)` Object Compaction

`O.match(...)` with `onNone: () => ({})` is usually a sign that object-shaping logic can be flatter.

Use `O.map(...)` plus `O.getOrElse(() => ({}))` when a single `Option` becomes an object.

Use `R.getSomes({...})` when independent `Option` fields should omit missing keys.

Use `S.OptionFromNullOr`, `S.OptionFromNullishOr`, `S.OptionFromOptionalKey`, or `S.OptionFromOptional` when optionality/nullability belongs at the schema boundary.
