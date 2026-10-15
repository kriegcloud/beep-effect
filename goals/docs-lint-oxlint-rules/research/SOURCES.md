# JSDoc/TSDoc lint lane on @beep/lint-rules, then ESLint removal — Sources & Provenance

- **Source exploration:** none — this goal was authored directly; build the
  corpus during the first research phase.

## 1. Mined source corpus

| Source | Title | Upstream (repo) | Location (`file:line`) | Theme | Disposition |
|--------|-------|-----------------|------------------------|-------|-------------|

## 2. Upstream repositories & licenses

| Repo | License | Port discipline | What we take |
|------|---------|-----------------|--------------|

## 3. External research sources

## 4. In-repo capability references

## 5. Cross-links & provenance

## Implementation evidence

- `.oxlintrc.docs.json` and @beep/lint-rules `src/rules/docs*` own the new runtime.
- Effect APIs were checked in installed `node_modules/effect/dist/*.d.ts`; foreign AST and
  parser APIs in @oxlint/plugins, comment-parser and Microsoft TSDoc declarations.
- `docs/runbooks/typescript-toolchain.md` and `goals/tsc-rs-gates/SPEC.md` govern compiler gates.
- https://oxc.rs/docs/guide/usage/linter/js-plugins.html describes plugin aliases and API support.
- Original behavior is recorded in the retained DocsESLintConfig and installed jsdoc rule source.
- No repo-configs source moves occurred, so coverage move baselines and laws paths stay intact.
