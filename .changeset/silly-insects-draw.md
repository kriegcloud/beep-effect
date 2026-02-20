---
"@effect/docgen": minor
---

- **Extracts examples from descriptions** – This can be disabled using `skip-type-checking` metadata on fenced code blocks. `@example` tags still work, but we may remove them in the future.
- **Supports the `@throws` JSDoc tag** – Properly documents possible errors.
- **Basic support for the `@see` JSDoc tag** – Displays only the API name and description.
- **Adds GitHub source links** – Provides direct access to the corresponding source code.
- **Repositions signatures** – Now moved further down, just before the source link and `@since` tag, for better readability.
