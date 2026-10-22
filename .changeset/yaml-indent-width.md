---
"@beep/yaml": patch
---

Decode the stringify `indent` option (`YamlStringifyOptions.indent`) through the
new `IndentWidth` schema, a non-negative integer. Before, a negative indent
silently produced empty indentation; it now fails at decode, as do fractions.
`0` stays valid.
