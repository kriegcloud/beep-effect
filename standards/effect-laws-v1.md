# Effect Laws v1

Compact, enforceable laws for this codebase. Keep agent-facing files terse; keep details here.

## Short Laws (authoritative)

1. Use `A/O/P/R/S` aliases only:
   - `import * as A from "effect/Array"`
   - `import * as O from "effect/Option"`
   - `import * as P from "effect/Predicate"`
   - `import * as R from "effect/Record"`
   - `import * as S from "effect/Schema"`
2. For other stable helper/data modules, prefer dedicated namespace imports (`effect/String` as `Str`, `effect/Equal` as `Eq`, `effect/Boolean` as `Bool`, etc.); reserve root `effect` imports for core combinators/types such as `Effect`, `Match`, `pipe`, and `flow`.
3. `effect/unstable/*` imports are allowed when needed.
4. No `any`, type assertions, `@ts-ignore`, or non-null assertions.
5. No runtime `typeof ... === ...`; use `effect/Predicate` guards.
6. No native `Object/Map/Set/Date` in domain logic.
7. No native `Error` in `tooling/*/src`; use `TaggedErrorClass` from `@beep/schema` for typed errors.
8. No `node:path` in runtime source; use `Path.Path` service APIs.
9. No native `fetch` in runtime source; use `effect/unstable/http` and provide platform client layers.
10. No native `Array.prototype.sort`; use `A.sort` with explicit `Order`.
11. Use `Bool.match` for boolean branching in domain/runtime orchestration code.
12. Prefer schema defaults and transformations (`S.withDecodingDefault*`, `S.decodeTo`, `SchemaTransformation`) over ad-hoc parsing/fallback logic.
13. HTTP boundaries must be expressed with Effect HTTP modules (`HttpClientRequest`, `HttpClientResponse`, `Headers`, `UrlParams`, `HttpMethod`, `HttpBody`).
14. JSDoc is required for exported APIs in `packages/*/src` and `tooling/*/src`; examples must pass docgen.
15. Do not finish work with failing `check`, `lint`, `test`, or `docgen`.
16. Named or reused domain constraints are modeled as schemas first; prefer built-in schema constructors/checks before `S.makeFilter`, and derive guards with `S.is(...)`.
17. Reusable `S.makeFilter`, `S.makeFilterGroup`, and reusable built-in check blocks must include `identifier`, `title`, and `description`; `message` stays user-facing.
18. Use `LiteralKit` for internal literal domains when `.is`, `.thunk`, `$match`, or annotation-bearing schema values are part of the design.
19. Prefer the tersest equivalent Effect helper form when behavior is unchanged: direct helper refs over trivial wrapper lambdas, `flow(...)` for passthrough `pipe(...)` callbacks, and shared thunk helpers when already in scope.

## Allowlist Contract

Boundary exceptions are allowed only through [effect-laws.allowlist.jsonc](/home/elpresidank/YeeBois/projects/beep-effect3/standards/effect-laws.allowlist.jsonc).

Required fields per entry:

- `rule`: checker rule id
- `file`: repo-relative path
- `kind`: violation kind discriminator
- `reason`: why this boundary exception is currently necessary
- `owner`: responsible team or package
- `issue`: tracking issue URL or id

Optional fields:

- `expiresOn`: `YYYY-MM-DD`

## Scope

Wave 1 enforcement scope:

- `apps/**`
- `packages/**`
- `tooling/**`
- `infra/**`
- `.claude/hooks/**`

Excludes by default:

- tests/specs/storybook snapshots/fixtures
- generated artifacts

## Rollout

1. Warnings + reporting.
2. Codemod/autofix for mechanical import normalization.
3. Manual cleanup for remaining violations.
4. Promote selected warnings to errors once baseline is near zero.

## Deep References

- [JSDoc patterns](/home/elpresidank/YeeBois/projects/beep-effect3/.patterns/jsdoc-documentation.md)
- [Effect library development patterns](/home/elpresidank/YeeBois/projects/beep-effect3/.patterns/effect-library-development.md)
- [Effect-first development](/home/elpresidank/YeeBois/projects/beep-effect3/standards/effect-first-development.md)
