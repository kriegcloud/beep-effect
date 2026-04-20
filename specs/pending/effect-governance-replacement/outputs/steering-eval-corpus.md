# Effect Governance Replacement - Steering Evaluation Corpus

## Status

**LOCKED**

## Purpose

This is the fixed corpus used to judge whether the replacement path preserves current repo-law parity and improves default agent steering.

## Locked Sources

- `tooling/configs/test/eslint-rules.test.ts`
- repo-real idiom cases that matter to the steering goal
- small synthetic cases only when a repo-real or fixture-derived case does not exist

## Locked Case Index

| ID | Family | Mode | Expected Judgment | Source |
|---|---|---|---|---|
| `IMP-01` | `effect-import-style` | `binary-parity` | must flag alias mismatch and recommend alias `A` | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:136) |
| `IMP-02` | `effect-import-style` | `binary-parity` | must flag root alias import and recommend namespace import from `effect/String` | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:209) |
| `RUN-01` | `no-native-runtime` | `binary-parity` | must flag `new Date()` in non-allowlisted code | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:243) |
| `RUN-02` | `no-native-runtime` | `binary-parity` | must flag native error bracket-constructor form | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:323) |
| `SCH-01` | `schema-first` | `binary-parity` | must flag exported pure-data interface | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:150) |
| `SCH-02` | `schema-first` | `binary-parity` | must not flag exported service-like interface with function member | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:160) |
| `TRS-01` | `terse-effect-style` | `binary-parity` | must flag direct-helper wrapper lambda and prefer helper reference | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:381) |
| `TRS-02` | `terse-effect-style` | `binary-parity` | must flag passthrough `pipe(...)` callback and prefer `flow(...)` | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:409) |
| `TRS-03` | `terse-effect-style` | `binary-parity` | must flag trivial literal thunk when shared helper is already imported | [eslint-rules.test.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/configs/test/eslint-rules.test.ts:441) |
| `IDI-01` | idiomaticity gap | `strong-nudge` | should receive a default-path nudge toward flatter control flow or helper exploration | [useNumberInput.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ui/src/hooks/useNumberInput.ts:305) |
| `IDI-02` | idiomaticity gap | `soft-review` | candidate may keep or rewrite, but it must demonstrate matcher-shape awareness | [Server/index.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/v2t-sidecar/src/Server/index.ts:285) |
| `IDI-03` | idiomaticity gap | `soft-review` | candidate may keep or rewrite, but boundary-use acceptance must be explicit if left unchanged | [Server/index.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/v2t-sidecar/src/Server/index.ts:333) |

## Locked Snippets

### `IMP-01`

```ts
import * as ArrayAlias from "effect/Array";
export const value = 1;
```

### `IMP-02`

```ts
import { pipe, String as Str } from "effect";
export const value = pipe("a", Str.toUpperCase);
```

### `RUN-01`

```ts
export const value = new Date();
```

### `RUN-02`

```ts
export const fail = () => { throw new globalThis["TypeError"]("boom"); };
```

### `SCH-01`

```ts
export interface StorageConfigShape {
  readonly enabled: boolean;
}
```

### `SCH-02`

```ts
export interface StorageService {
  readonly get: (key: string) => Promise<string>;
}
```

### `TRS-01`

```ts
import * as A from "effect/Array";
export const value = { onNone: () => A.empty<string>() };
```

### `TRS-02`

```ts
import { pipe } from "effect";
import * as O from "effect/Option";
declare const parse: (value: string) => O.Option<string>;
export const value = (input) => pipe(input, parse, O.getOrElse(() => input));
```

### `TRS-03`

```ts
import { thunkUndefined } from "@beep/utils";
export const value = { onNone: () => undefined };
```

### `IDI-01`

```ts
const ratio = Bool.match(event.shiftKey === true, {
  onTrue: () => 10,
  onFalse: () =>
    Bool.match(event.metaKey === true || event.ctrlKey === true, {
      onTrue: () => 0.1,
      onFalse: () => 1,
    }),
});
```

### `IDI-02`

```ts
const internalRunnerHost = (host: string): string =>
  Match.value(host).pipe(
    Match.when("0.0.0.0", () => "127.0.0.1"),
    Match.when("::", () => "::1"),
    Match.orElse(() => host)
  );
```

### `IDI-03`

```ts
return yield* O.match(appDataDir, {
  onNone: () =>
    findRepoRootOrStart(process.cwd()).pipe(Effect.map((repoRoot) => path.resolve(repoRoot, ".beep/vt2"))),
  onSome: (configuredAppDataDir) => Effect.succeed(path.resolve(configuredAppDataDir)),
});
```

## Locked Rubric

### Binary Parity Cases

- Mode: `binary-parity`
- Applicable cases: `IMP-01` through `TRS-03`
- Pass rule:
  - the candidate surface must reproduce the current repo-law judgment for the case, or
  - the parity matrix must explicitly record a stronger intentional source-of-truth remap for that family
- Fail rule:
  - the candidate misses the case
  - the candidate reverses the current repo-law judgment
  - the candidate depends on explicit opt-in instead of the validated default-path surface for that family

### Steering Review Cases

- Modes:
  - `strong-nudge`: `IDI-01`
  - `soft-review`: `IDI-02`, `IDI-03`
- Use these locked yes or no dimensions:
  - detects the pattern
  - proposes or preserves a credible alternative
  - steers by default rather than requiring explicit opt-in
  - preserves clarity
  - preserves or improves exhaustiveness

### Pass Or Fail Interpretation

- `strong-nudge` passes only when the candidate gives a default-path advisory or diagnostic and points to a concrete flatter alternative without reducing clarity or exhaustiveness.
- `soft-review` passes when the candidate either:
  - gives a default-path advisory with a credible flatter alternative, or
  - explicitly keeps the current code and justifies why the boundary shape is acceptable
- `soft-review` fails when the candidate is silent, gives only vague advice, or pushes a rewrite that harms clarity or exhaustiveness.

## Locked Scope Notes

- The corpus intentionally mixes current-rule parity cases with user-goal idiomaticity cases.
- `schema-first` widening cases discovered by the inventory command are tracked in the parity matrix and planning notes, not in the locked binary corpus.
- P4 must reuse this file unchanged.
