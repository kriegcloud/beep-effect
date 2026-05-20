# CSF-063: Markdown-to-HTML schema allows raw script tags by default

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 0cf18c4 |
| Reported age | 1mo ago |
| Capture method | dom-fallback |
| Owner area | packages/common/schema/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a Markdown-to-HTML transformation that does not sanitize or filter raw HTML by default, enabling XSS when used with untrusted input.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Markdown HTML rendering now enables Bun's tagFilter option by default while still allowing callers to opt out explicitly for trusted input.
- Remediation status: `fixed-in-branch`
- Verification command: `cd packages/foundation/modeling/schema && bunx --bun vitest run test/Markdown.test.ts && bunx tsc --noEmit --pretty false -p tsconfig.json`
- Changed files:
  - packages/foundation/modeling/schema/src/Markdown.ts
  - packages/foundation/modeling/schema/test/Markdown.test.ts
- Verification notes:
  - The Markdown tests assert script tags are escaped by default and only raw when tagFilter is explicitly false.

## Evidence Paths

- packages/common/schema/src/Markdown.ts
- packages/common/schema/test/Markdown.test.ts

## Validation Notes From Codex

- Identify how MarkdownTextToHtml renders Markdown and confirm it uses Bun defaults when options are undefined (Markdown.ts:28-32, 48-56).
- Verify tests show raw <script> is preserved by default and escaped only with tagFilter (Markdown.test.ts:10-22).
- Dynamically reproduce the default renderer output in this container (blocked because Bun.markdown is undefined in installed Bun).
- Demonstrate end-to-end rendering in app/UI context (not attempted; out of scope for minimal validation).

## Sanitized Finding Content

```text
Finding
Markdown-to-HTML schema allows raw script tags by default
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
0cf18c4
2:39 AM Apr 4, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a Markdown-to-HTML transformation that does not sanitize or filter raw HTML by default, enabling XSS when used with untrusted input.
The commit introduces a MarkdownTextToHtml schema that calls Bun.markdown.html with default options. Bun’s default renderer preserves raw HTML, which means `<script>` tags are passed through unless callers explicitly enable the `tagFilter` option. If this helper is used to render untrusted Markdown into the Tauri/webview UI, it enables XSS and potential access to privileged UI capabilities. The accompanying tests explicitly assert that a `<script>` tag is preserved under default options.
Validation
Identify how MarkdownTextToHtml renders Markdown and confirm it uses Bun defaults when options are undefined (Markdown.ts:28-32, 48-56).
Verify tests show raw <script> is preserved by default and escaped only with tagFilter (Markdown.test.ts:10-22).
Dynamically reproduce the default renderer output in this container (blocked because Bun.markdown is undefined in installed Bun).
Demonstrate end-to-end rendering in app/UI context (not attempted; out of scope for minimal validation).
Validation artifact
Evidence
packages/common/schema/src/Markdown.ts
28
const makeRenderMarkdownHtml = (options?: Bun.markdown.Options) =>
29
Effect.fn("Markdown.renderMarkdownHtml")(function* (content: string) {
30
return yield* Effect.try({
31
try: () => (options === undefined ? Bun.markdown.html(content) : Bun.markdown.html(content, options)),
32
catch: (cause) =>
33
invalidMarkdownInput(
34
content,
35
P.isError(cause) ? `Invalid Markdown input (${cause.message}).` : "Invalid Markdown input."
36
),
packages/common/schema/test/Markdown.test.ts
10
it.effect("renders Markdown text to HTML with Bun defaults", () =>
11
Effect.gen(function* () {
12
const html = yield* decodeMarkdownTextAs(S.String)("<script>x</script>");
13
14
expect(html).toBe("<script>x</script>\n");
15
})
16
);
17
18
it.effect("forwards Bun Markdown options through the schema factory", () =>
19
Effect.gen(function* () {
20
const html = yield* decodeMarkdownTextAs(S.String, { tagFilter: true })("<script>x</script>");
21
22
expect(html).toBe("&lt;script>x&lt;/script>\n");
Attack-path analysis
Although the helper preserves raw HTML by default (Markdown.ts:28-32) and tests demonstrate <script> tags pass through (Markdown.test.ts:10-22), there is no evidence it is used in production paths in this repo. The threat model’s UI XSS risk is therefore not demonstrably reachable, and the desktop app’s CSP further mitigates inline script execution (tauri.conf.json:25-43). Downgraded from medium to ignore due to lack of in-scope reachability and mitigations in the primary product surface.
Path
Untrusted Markdown input --decodeMarkdownTextAs--> MarkdownTextToHtml (Bun.markdown.html default) --unsanitized HTML output--> HTML inserted into UI/webview --browser executes script--> Script execution in UI context
MarkdownTextToHtml uses Bun.markdown.html with default options when no options are passed, preserving raw HTML (Markdown.ts:28-32). Tests explicitly assert that a <script> tag is preserved by default and only escaped when tagFilter is provided (Markdown.test.ts:10-22). However, no production usage of this helper was found in the repo, so attacker reachability is unproven. For the desktop app, a production CSP is configured with script-src 'self' (tauri.conf.json:25-43), which would block inline <script> execution if the output is rendered in the webview.
Likelihood
Low - No in-repo usage found; exploitation requires a caller to render untrusted Markdown into a UI without sanitization.
Impact
Low - If this helper were used to render untrusted Markdown into a UI/webview, it could enable XSS-style script execution; no such usage is shown in this repo.
Assumptions
git grep only found MarkdownTextToHtml/decodeMarkdownTextAs references in the schema file and its tests; no production usage was identified in this repo.
Any XSS impact requires the rendered HTML to be inserted into a UI/webview without additional sanitization or safe rendering.
Caller uses MarkdownTextToHtml with default options on untrusted Markdown
Rendered HTML is injected into a UI/webview as HTML (not text)
Controls
Optional Bun tagFilter parameter can escape HTML
Production CSP configured for the desktop webview
Blindspots
Static-only analysis; no dynamic execution of Bun.markdown in this environment.
Potential external consumers of @beep/schema could use this helper in ways not visible in this repo.
Finding content copied
Finding content copied
```
