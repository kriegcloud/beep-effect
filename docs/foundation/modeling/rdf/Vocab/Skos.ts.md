---
title: Skos.ts
nav_order: 12
parent: "@beep/rdf"
---

## Skos.ts overview

SKOS vocabulary helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [SKOS_NAMESPACE](#skos_namespace)
- [models](#models)
  - [SKOS_ALT_LABEL](#skos_alt_label)
  - [SKOS_BROADER](#skos_broader)
  - [SKOS_BROAD_MATCH](#skos_broad_match)
  - [SKOS_CLOSE_MATCH](#skos_close_match)
  - [SKOS_CONCEPT](#skos_concept)
  - [SKOS_CONCEPT_SCHEME](#skos_concept_scheme)
  - [SKOS_DEFINITION](#skos_definition)
  - [SKOS_EDITORIAL_NOTE](#skos_editorial_note)
  - [SKOS_EXACT_MATCH](#skos_exact_match)
  - [SKOS_HAS_TOP_CONCEPT](#skos_has_top_concept)
  - [SKOS_HIDDEN_LABEL](#skos_hidden_label)
  - [SKOS_HISTORY_NOTE](#skos_history_note)
  - [SKOS_IN_SCHEME](#skos_in_scheme)
  - [SKOS_NARROWER](#skos_narrower)
  - [SKOS_NARROW_MATCH](#skos_narrow_match)
  - [SKOS_PREF_LABEL](#skos_pref_label)
  - [SKOS_RELATED](#skos_related)
  - [SKOS_RELATED_MATCH](#skos_related_match)
  - [SKOS_SCOPE_NOTE](#skos_scope_note)
  - [SKOS_TOP_CONCEPT_OF](#skos_top_concept_of)
---

# configuration

## SKOS_NAMESPACE

SKOS namespace IRI.

**Example**

```ts
import { SKOS_NAMESPACE } from "@beep/rdf/Vocab/Skos"

console.log(SKOS_NAMESPACE)
```

**See**

- https://www.w3.org/TR/skos-reference/

**Signature**

```ts
declare const SKOS_NAMESPACE: "http://www.w3.org/2004/02/skos/core#"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L24)

Since v0.0.0

# models

## SKOS_ALT_LABEL

`skos:altLabel`

**Signature**

```ts
declare const SKOS_ALT_LABEL: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L56)

Since v0.0.0

## SKOS_BROADER

`skos:broader`

**Signature**

```ts
declare const SKOS_BROADER: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L104)

Since v0.0.0

## SKOS_BROAD_MATCH

`skos:broadMatch`

**Signature**

```ts
declare const SKOS_BROAD_MATCH: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L144)

Since v0.0.0

## SKOS_CLOSE_MATCH

`skos:closeMatch`

**Signature**

```ts
declare const SKOS_CLOSE_MATCH: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L136)

Since v0.0.0

## SKOS_CONCEPT

`skos:Concept`

**Signature**

```ts
declare const SKOS_CONCEPT: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L32)

Since v0.0.0

## SKOS_CONCEPT_SCHEME

`skos:ConceptScheme`

**Signature**

```ts
declare const SKOS_CONCEPT_SCHEME: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L40)

Since v0.0.0

## SKOS_DEFINITION

`skos:definition`

**Signature**

```ts
declare const SKOS_DEFINITION: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L72)

Since v0.0.0

## SKOS_EDITORIAL_NOTE

`skos:editorialNote`

**Signature**

```ts
declare const SKOS_EDITORIAL_NOTE: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L88)

Since v0.0.0

## SKOS_EXACT_MATCH

`skos:exactMatch`

**Signature**

```ts
declare const SKOS_EXACT_MATCH: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L128)

Since v0.0.0

## SKOS_HAS_TOP_CONCEPT

`skos:hasTopConcept`

**Signature**

```ts
declare const SKOS_HAS_TOP_CONCEPT: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L176)

Since v0.0.0

## SKOS_HIDDEN_LABEL

`skos:hiddenLabel`

**Signature**

```ts
declare const SKOS_HIDDEN_LABEL: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L64)

Since v0.0.0

## SKOS_HISTORY_NOTE

`skos:historyNote`

**Signature**

```ts
declare const SKOS_HISTORY_NOTE: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L96)

Since v0.0.0

## SKOS_IN_SCHEME

`skos:inScheme`

**Signature**

```ts
declare const SKOS_IN_SCHEME: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L168)

Since v0.0.0

## SKOS_NARROWER

`skos:narrower`

**Signature**

```ts
declare const SKOS_NARROWER: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L112)

Since v0.0.0

## SKOS_NARROW_MATCH

`skos:narrowMatch`

**Signature**

```ts
declare const SKOS_NARROW_MATCH: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L152)

Since v0.0.0

## SKOS_PREF_LABEL

`skos:prefLabel`

**Signature**

```ts
declare const SKOS_PREF_LABEL: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L48)

Since v0.0.0

## SKOS_RELATED

`skos:related`

**Signature**

```ts
declare const SKOS_RELATED: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L120)

Since v0.0.0

## SKOS_RELATED_MATCH

`skos:relatedMatch`

**Signature**

```ts
declare const SKOS_RELATED_MATCH: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L160)

Since v0.0.0

## SKOS_SCOPE_NOTE

`skos:scopeNote`

**Signature**

```ts
declare const SKOS_SCOPE_NOTE: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L80)

Since v0.0.0

## SKOS_TOP_CONCEPT_OF

`skos:topConceptOf`

**Signature**

```ts
declare const SKOS_TOP_CONCEPT_OF: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Skos.ts#L184)

Since v0.0.0