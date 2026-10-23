### What is the problem this feature would solve?

`Schema.Literals` has `pick` but no way to express "every member except these". When a union has many members and a field needs all but a few, the only option today is to spell out the kept members:

```ts
const OfficeCode = Schema.Literals(["AD", "AE", "AF", /* ... 240 codes ... */ "US", "XX", "ZW"])

// every office except "US" and "XX"
const ForeignOfficeCode = OfficeCode.pick(["AD", "AE", "AF", /* ... 238 codes ... */ "ZW"])
```

The hand-written list is right on the day it's written. Add a code to `OfficeCode` later and `ForeignOfficeCode` doesn't get it, with nothing in the types to say so. I meant a complement, and the code records an enumeration.

A type-level workaround exists (`Exclude<typeof OfficeCode.Type, "US" | "XX">`). It doesn't produce a schema, though, and rebuilding the tuple at runtime means filtering `literals` by hand and casting the result back to a tuple type.

### What is the feature you are proposing to solve the problem?

An `omit` method on `Literals`, the dual of `pick`:

```ts
const ForeignOfficeCode = OfficeCode.omit(["US", "XX"])
// Literals<readonly ["AD", "AE", "AF", ..., "ZW"]>
```

- **Types.** `omit<const L2 extends ReadonlyArray<L[number]>>(literals: L2): Literals<Without<L, L2[number]>>`. `Without` filters the tuple and keeps positions, so `members` and `transform` stay positional:

  ```ts
  type Without<L extends ReadonlyArray<unknown>, E> = L extends readonly [infer H, ...infer T]
    ? H extends E ? Without<T, E> : readonly [H, ...Without<T, E>]
    : L extends readonly [] ? readonly [] : ReadonlyArray<Exclude<L[number], E>>
  ```

- **Implementation.** `Literals(literals.filter((l) => !omitted.includes(l)))`, beside `pick` in the object passed to `make`.
- **Empty result.** `pick([])` compiles today and returns an empty union that rejects every input. `omit` of every member would do the same. If you'd rather reject it at the type level, the result type can collapse to `never`.
- **Tests.** Runtime decode and order assertions next to the existing `pick` test in `test/schema/Schema.test.ts`, plus type tests for tuple order and for a non-tuple `ReadonlyArray` input.

### What alternatives have you considered?

- **`pick` with the complement written out.** It works, but it goes stale as the parent grows, which is the problem described above.
- **A standalone `Schema.Literals` constructor over `Exclude`.** The members have to come back as a runtime tuple anyway, so the filter belongs next to `pick`, where `literals` is already in scope.
- **Recomputing the tuple at each call site.** A cast at every use, with the order and positional typing left to the caller.

I'm happy to open a PR with the code, docs and tests if the shape works for you.

Checked against `main` at 43e6a17 on 2026-10-22.
