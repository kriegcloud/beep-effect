---
title: WinkBackend.service.ts
nav_order: 6
parent: "@beep/wink"
---

## WinkBackend.service.ts overview

WinkBackend - an `NLPBackend` implementation backed by wink-nlp.

Implements the pluggable `NLPBackend` contract on top of the existing
`WinkEngine` service (the single wink-nlp wrapper in this package), so the
model lifecycle is owned in one place. Provides tokenization, sentence
detection, POS tagging, lemmatization, and named-entity recognition; dependency
parsing and relation extraction are unsupported and fail with
`BackendNotSupported`.

Effect v4 `@beep/nlp` implementation notes:
- instead of instantiating its own `winkNLP(model)`, it reads the existing
  `WinkEngine` service (one wink wrapper, shared lifecycle).
- `doc...out(its.detail)` accessors are assigned to typed
  `ItsFunction<...>` locals (the proven repo pattern) and the
  `Detail | string` entity output is narrowed with `typeof`, so there are no
  assertions.
- service methods use `Effect.fn`; nodes are built with `Schema.X.make(...)` and
  a `Clock`-sourced timestamp (was `new S.XNode(...)` + `Date.now()`).

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [WinkBackendLive](#winkbackendlive)
---

# layers

## WinkBackendLive

Live `NLPBackend` layer backed by wink-nlp (requires `WinkEngine`).

**Example**

```ts
import { WinkBackendLive } from "@beep/wink"

console.log(WinkBackendLive)
```

**Signature**

```ts
declare const WinkBackendLive: Layer.Layer<NLPBackend, never, WinkEngine>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkBackend.service.ts#L150)

Since v0.0.0