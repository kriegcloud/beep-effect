# Codex Orchestration Prompt: Fix All Biome Effect Lint Violations

## Context

The monorepo at `/home/elpresidank/YeeBois/projects/beep-effect` uses `@catenarycloud/linteffect` — a Biome Grit plugin with 48 rules enforcing declarative, flat, explicit Effect TypeScript patterns. There are ~1780 violations across ~1225 files. Your job is to fix ALL of them.

**Reference:** Read `lint-inventory.md` in the repo root for the full violation breakdown by rule, by package, fix patterns, and priority classification.

## Strategy

Spawn parallel subagents, one per package scope. Each subagent fixes all violations in its assigned scope, then verifies with `bunx biome check <scope> --max-diagnostics=0`.

### Subagent Assignments

Spawn these subagents **in parallel** (ordered by violation count descending):

| Agent | Scope | ~Violations |
|-------|-------|------------|
| agent-common-schema | `packages/common/schema/` | 260 |
| agent-cli | `tooling/cli/` | 343 |
| agent-common-ui | `packages/common/ui/` | 120 |
| agent-repo-memory | `packages/repo-memory/` | 161 |
| agent-common-observability | `packages/common/observability/` | 82 |
| agent-repo-utils | `tooling/repo-utils/` | 120 |
| agent-common-rest | `packages/common/semantic-web/` + `packages/common/nlp/` + `packages/common/utils/` + `packages/common/identity/` | 161 |
| agent-desktop | `apps/desktop/` | 72 |
| agent-docgen | `tooling/docgen/` | 60 |
| agent-configs | `tooling/configs/` | 52 |
| agent-runtime | `packages/runtime/` | 52 |
| agent-editor-app | `apps/editor-app/` | 49 |
| agent-shared | `packages/shared/` | 29 |
| agent-editor | `packages/editor/` | 28 |
| agent-test-utils | `tooling/test-utils/` | 11 |
| agent-claude | `.claude/` | 155 |

### Subagent Instructions (copy into each subagent prompt)

```
You are fixing Biome Effect lint violations in: <SCOPE_PATH>

## Setup
1. Run `bunx biome check <SCOPE_PATH> --max-diagnostics=0` to see all violations in your scope.
2. Read `lint-inventory.md` for fix patterns per rule.

## Rules of Engagement
- Fix violations in order: mechanical first, structural second, domain third.
- NEVER suppress a rule with an ignore comment. Fix the actual code.
- NEVER change behavior. These are structural refactors, not feature changes.
- Preserve all existing tests. If a test file has violations, fix the test code too.
- When replacing `if/else` or ternary: use `Match.value`, `Option.match`, `Either.match`, or `Effect.if`.
- When flattening pipes: extract intermediate values to `const` bindings, keep one flat pipeline.
- When removing type annotations (`Effect.Effect<A,E,R>`): just delete them, let TypeScript infer.
- When replacing React hooks: use `@effect-atom/atom-react` — `Atom` for client state, `runtime.atom()` for server state.
- When replacing string sentinels: use tagged unions with `S.TaggedStruct` or `Option`/`Either`.
- When replacing `try/catch`: use `Effect.try`, `Effect.tryPromise`, or typed error constructors.
- When replacing `Effect.fn` generators: use a single `Effect.gen` or flat pipe chain.

## Fix Patterns by Rule

### no-manual-effect-channels (MECHANICAL)
```ts
// Before
const foo = (x: string): Effect.Effect<User, HttpError, UserService> =>
  UserService.pipe(Effect.flatMap(svc => svc.get(x)))

// After — just delete the return type annotation
const foo = (x: string) =>
  UserService.pipe(Effect.flatMap(svc => svc.get(x)))
```

### no-return-in-arrow (MECHANICAL)
```ts
// Before
const fn = (x: number) => { return x + 1 }

// After
const fn = (x: number) => x + 1
```

### no-pipe-ladder (STRUCTURAL)
```ts
// Before
pipe(
  someEffect,
  Effect.map(x =>
    pipe(
      otherEffect(x),
      Effect.map(y => y.value)
    )
  )
)

// After
pipe(
  someEffect,
  Effect.flatMap(x => otherEffect(x)),
  Effect.map(y => y.value)
)
```

### no-if-statement / no-ternary (STRUCTURAL)
```ts
// Before
if (condition) { return Effect.succeed(a) } else { return Effect.succeed(b) }
const x = condition ? a : b

// After
Match.value(condition).pipe(
  Match.when(true, () => a),
  Match.orElse(() => b)
)
// or for Option:
Option.match(maybeValue, { onNone: () => fallback, onSome: (v) => v })
// or for simple Effect branching:
Effect.if(conditionEffect, { onTrue: () => a, onFalse: () => b })
```

### no-react-state (DOMAIN)
```ts
// Before
const [value, setValue] = useState(initial)

// After
const value = Atom.use(myAtom)
// Define atom outside component:
const myAtom = Atom.of(initial)
```

### no-string-sentinel-const / no-string-sentinel-return (DOMAIN)
```ts
// Before
const status = "loading" | "error" | "success"
return "not_found"

// After
type Status = S.TaggedStruct<"Loading", {}> | S.TaggedStruct<"Error", { message: string }> | S.TaggedStruct<"Success", { data: T }>
return Option.none()  // or Effect.fail(new NotFoundError())
```

### no-try-catch (DOMAIN)
```ts
// Before
try { const x = JSON.parse(raw) } catch (e) { return null }

// After
Effect.try({
  try: () => JSON.parse(raw),
  catch: (e) => new ParseError({ cause: e })
})
```

## Verification
After all fixes:
```bash
bunx biome check <SCOPE_PATH> --max-diagnostics=0
```

Target: **zero errors, zero warnings** in your scope.
If a violation cannot be fixed without changing behavior, document it and move on.
```

## Orchestrator Workflow

1. **Read** `lint-inventory.md` for full context.
2. **Spawn** all 16 subagents in parallel with the scope-specific prompt above.
3. **Collect** results from each subagent.
4. **Run** final full-repo verification: `bunx biome check . --max-diagnostics=0`
5. **Run** type check: `pnpm check` (or `bun run check`)
6. **Run** tests: `pnpm test`
7. **Run** lint: `pnpm lint-fix`
8. If any subagent left violations, spawn a cleanup agent targeting those specific files.

## Constraints

- Do NOT add `// biome-ignore` comments. Fix the code.
- Do NOT change observable behavior. These are structural refactors only.
- Do NOT modify `biome.jsonc` or rule configuration.
- Do NOT add new dependencies.
- Preserve all existing imports, exports, and public APIs.
- Run verification after each package scope is complete.
