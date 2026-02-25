# CODEBASE LAWS v1 (Compact)

Detailed guidance lives in [standards/effect-laws-v1.md](/home/elpresidank/YeeBois/projects/beep-effect3/standards/effect-laws-v1.md).

1. Use `A/O/P/R/S` aliases only: `effect/Array`, `Option`, `Predicate`, `Record`, `Schema`.
2. For other stable modules, prefer root imports from `"effect"`; `effect/unstable/*` is allowed.
3. No `any`, type assertions, `@ts-ignore`, or non-null assertions.
4. No runtime `typeof ... === ...`; use `effect/Predicate`.
5. No native `Object/Map/Set/Date` in domain logic; boundary-only via allowlist.
6. No native `Error` in `tooling/*/src`; use `S.TaggedErrorClass`-based typed errors.
7. JSDoc required for exported APIs in package/tooling source; examples must pass docgen.
8. Exceptions require allowlist entry with `reason`, `owner`, `issue`, optional `expiresOn`.
9. Do not finish work with failing `check`, `lint`, `test`, or `docgen`.
