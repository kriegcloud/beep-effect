---
"@beep/pandoc-ast": patch
---

Complete the Md→Pandoc compatibility mapping for the new `table` and `youtube`
Md block variants. Md tables degrade to a paragraph capture (the v1 Pandoc-core
profile records tables as gap nodes) and YouTube embeds project to a plain
Pandoc link, both with recorded compatibility issues, and both render in
plain-text extraction. Restores the `@beep/pandoc-ast` build after the
`table`/`youtube` blocks were introduced to `@beep/md`.
