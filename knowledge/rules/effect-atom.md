# Effect Atom

Use this file when working with `effect/unstable/reactivity`, `@effect/atom-react`, `AsyncResult`, `Atom.family`, or `FormReact` state built on atoms.

## Core Model

- Model the real system state. Atoms that load remote data expose loading, success, failure, and sometimes empty states. The UI must preserve those distinctions.
- `AsyncResult` is not data. It is state plus data. Render it directly instead of flattening it into fake fallback values.
- Do not build custom loading, success, failure, or empty state tracking beside the atom. Represent async lifecycle with `AsyncResult`.
- Prefer explicit state handling with `AsyncResult.builder` at route or page boundaries.

## AsyncResult Handling

- Guard async state at the parent boundary with `AsyncResult.builder` or `RetryAtom` plus builder.
- Render children only from `.onSuccess(...)` when they require the loaded value.
- In success only children, derive the same atom locally and unwrap with `useAtomValue(atom).pipe(AsyncResult.getOrThrow)`.
- Use `result.waiting` for loading semantics. Do not infer loading from `!AsyncResult.isSuccess(result)`.
- Do not collapse `AsyncResult` into empty arrays, empty objects, or other fake defaults.
- Do not treat failure or loading as empty data.
- Do not maintain parallel manual sync state for async lifecycle. Use `AsyncResult` as the single source of truth.
- Narrow async and remote state explicitly and render the real loading, failure, empty, and success UI states.
- Failure UI must show the real cause detail. Use `Banner.CauseDetail` or a similar component that inspects the `Cause` and renders the actual error information.
- Do not show generic error copy like `Something went wrong` without the real error details.

## Derive State Locally

- Pass ids, keys, and small stable inputs through props.
- Derive atom state at the point of use instead of prop drilling already resolved async data.
- Do not pass atoms as props.
- Prefer `Atom.readable` for read only derived atoms.
- `Atom.readable` suppresses downstream updates when the recomputed output is `Object.is` equal to the previous output.
- For derived object outputs, keep references stable when nothing semantically changed.

## Atom Placement

- Put shared atoms at module scope.
- Only create atoms inside a React component when the atom is truly scoped to that component instance.
- Component local atoms must be memoized from stable dependencies.
- Do not wrap `Atom.family(...)` lookups in `React.useMemo`. Memoize the key when needed, not the family lookup.

## Atom.family Keys

- Use `Atom.family` whenever atom identity depends on input.
- Use `Data.Class` keys for compound identity.
- Build keys with `static make`, not `new` at call sites.
- Include every id that isolates state.
- Keep shared ids at the root of the key.
- Put mode specific state in one nested discriminated `scope` property.
- Add `toString()` only when the key must leave memory for storage, URLs, logs, or similar external uses.

```ts
class VariantFormKey extends Data.Class<{
  experimentId: ExperimentId;
  scope:
    | { _tag: "Create"; }
    | { _tag: "Edit"; variantId: VariantId; };
}> {
  static make(args: {
    experimentId: ExperimentId;
    scope:
      | { _tag: "Create"; }
      | { _tag: "Edit"; variantId: VariantId; };
  }) {
    return new VariantFormKey(args);
  }
}

const variantFormAtom = Atom.family((key: VariantFormKey) =>
  FormReact.make({
    // form config
  })
);

const editKey = VariantFormKey.make({
  experimentId,
  scope: { _tag: "Edit", variantId },
});

const createKey = VariantFormKey.make({
  experimentId,
  scope: { _tag: "Create" },
});

const editForm = variantFormAtom(editKey);
const createForm = variantFormAtom(createKey);
```

## Forms And Draft State

- New multi instance forms must be created with `FormReact.make(...)` inside `Atom.family`.
- Treat top level singleton forms as legacy exceptions, not the preferred pattern.
- Draft state for separate entities or modes must not leak across instances. Encode that isolation in the family key.

## Service Boundaries

- Atoms that touch RPC, HTTP, storage, browser APIs, or cross module atom dependencies should go through dedicated service boundaries.
- Define explicit `ServiceMap.Service` wrappers around those dependencies.
- Use explicit wrapper methods like `someMethod: (...args) => client.someMethod(...args)`.
- Build a dedicated atom runtime for those services and yield services from context inside atom bodies.
- Do not reach directly for raw clients from arbitrary UI components.

## Equality And Hashing

- Do not assume `Atom.readable` uses Effect `Equal.equals`. Its change suppression is based on `Object.is`.
- Implementing Effect `Equal` and `Hash` does not change core `Atom.readable` update propagation.
- Implement `Equal` and `Hash` when you need semantic equality for hash keyed structures such as `Atom.family` keys and other hash based caches or collections.
- `Data.Class` is usually enough for immutable compound keys when full structural equality is correct.
- Only add custom `Equal` and `Hash` when the default structural semantics are too broad, too expensive, or semantically wrong.

## Testing

- Tests should use production composition and mock only true external boundaries.
- Never mock atoms, atom modules, or atom definitions.
- Provide test layers through the atom registry instead.

## Practical Anti Patterns

- `isSuccess ? value : []`
- `result.value ?? []`
- `isLoading`, `hasLoaded`, `status`, or similar manual lifecycle flags for atom backed remote state
- passing resolved remote data through many layers instead of deriving it locally
- passing atoms as props
- singleton `FormReact.make(...)` for new multi instance form state
- family keys that omit ids and let one draft overwrite another
- generic failure UI that hides the actual `Cause`
