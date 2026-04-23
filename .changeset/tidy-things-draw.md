---
"@beep/md": patch
"@beep/schema": patch
---

Improve markdown rendering safety and review-driven ergonomics.

- block percent-encoded protocol bypasses in URL destination sanitization
- preserve inline-code edge cases (boundary spaces, empty/multiline handling notes)
- clarify raw HTML and trusted fragment semantics in renderer/schema docs
- tighten md schema union composition to reuse variant codecs directly
