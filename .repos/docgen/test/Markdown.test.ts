import * as Domain from "@effect/docgen/Domain"
import * as Markdown from "@effect/docgen/Markdown"
import * as Effect from "effect/Effect"
import { flow } from "effect/Function"
import * as Option from "effect/Option"
import { assert, describe, it } from "vitest"

const testCases = {
  class: Domain.createClass(
    Domain.createNamedDoc(
      "A",
      Option.some("a class"),
      Option.some("1.0.0"),
      false,
      [{ body: "example 1", fences: { start: "```ts", end: "```" } }],
      Option.some("category")
    ),
    "declare class A { constructor() }",
    [
      Domain.createMethod(
        Domain.createNamedDoc(
          "hasOwnProperty",
          Option.none(),
          Option.some("1.0.0"),
          false,
          [],
          Option.none()
        ),
        ["hasOwnProperty(): boolean"]
      )
    ],
    [
      Domain.createMethod(
        Domain.createNamedDoc(
          "staticTest",
          Option.none(),
          Option.some("1.0.0"),
          false,
          [],
          Option.none()
        ),
        ["static testStatic(): string;"]
      )
    ],
    [
      Domain.createProperty(
        Domain.createNamedDoc(
          "foo",
          Option.none(),
          Option.some("1.0.0"),
          false,
          [],
          Option.none()
        ),
        "foo: string"
      )
    ]
  ),
  constant: Domain.createConstant(
    Domain.createNamedDoc(
      "test",
      Option.some("the test"),
      Option.some("1.0.0"),
      false,
      [],
      Option.some("constants")
    ),
    "declare const test: string"
  ),
  export: Domain.createExport(
    Domain.createNamedDoc(
      "test",
      Option.none(),
      Option.some("1.0.0"),
      false,
      [],
      Option.none()
    ),
    "export declare const test: typeof test"
  ),
  function: Domain.createFunction(
    Domain.createNamedDoc(
      "func",
      Option.some("a function"),
      Option.some("1.0.0"),
      true,
      [{ body: "example 1", fences: { start: "```ts", end: "```" } }],
      Option.none()
    ),
    ["declare const func: (test: string) => string"]
  ),
  interface: Domain.createInterface(
    Domain.createNamedDoc(
      "A",
      Option.none(),
      Option.some("1.0.0"),
      false,
      [],
      Option.none()
    ),
    "export interface A extends Record<string, unknown> {}"
  ),
  typeAlias: Domain.createTypeAlias(
    Domain.createNamedDoc(
      "A",
      Option.none(),
      Option.some("1.0.0"),
      false,
      [],
      Option.none()
    ),
    "export type A = number"
  ),
  namespace: Domain.createNamespace(
    Domain.createNamedDoc(
      "A",
      Option.none(),
      Option.some("1.0.0"),
      false,
      [],
      Option.none()
    ),
    [],
    [
      Domain.createTypeAlias(
        Domain.createNamedDoc(
          "B",
          Option.none(),
          Option.some("1.0.1"),
          false,
          [],
          Option.none()
        ),
        "export type B = string"
      )
    ],
    [
      Domain.createNamespace(
        Domain.createNamedDoc(
          "C",
          Option.none(),
          Option.some("1.0.2"),
          false,
          [],
          Option.none()
        ),
        [],
        [
          Domain.createTypeAlias(
            Domain.createNamedDoc(
              "D",
              Option.none(),
              Option.some("1.0.3"),
              false,
              [],
              Option.none()
            ),
            "export type D = number"
          )
        ],
        []
      )
    ]
  )
}

describe("Markdown", () => {
  it("printNamespace", async () => {
    const print = flow(Markdown.printNamespace, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.namespace, 0)),
      `## A (namespace)

Added in v1.0.0

### B (type alias)

**Signature**

\`\`\`ts
export type B = string
\`\`\`

Added in v1.0.1

### C (namespace)

Added in v1.0.2

#### D (type alias)

**Signature**

\`\`\`ts
export type D = number
\`\`\`

Added in v1.0.3
`
    )
  })

  it("printClass", async () => {
    const print = flow(Markdown.printClass, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.class)),
      `## A (class)

a class

**Signature**

\`\`\`ts
declare class A {
  constructor()
}
\`\`\`

**Example**

\`\`\`ts
example 1
\`\`\`

Added in v1.0.0

### staticTest (static method)

**Signature**

\`\`\`ts
static testStatic(): string;
\`\`\`

Added in v1.0.0

### hasOwnProperty (function) (method)

**Signature**

\`\`\`ts
hasOwnProperty(): boolean
\`\`\`

Added in v1.0.0

### foo (property)

**Signature**

\`\`\`ts
foo: string
\`\`\`

Added in v1.0.0
`
    )
  })

  it("printConstant", async () => {
    const print = flow(Markdown.printConstant, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.constant)),
      `## test

the test

**Signature**

\`\`\`ts
declare const test: string
\`\`\`

Added in v1.0.0
`
    )
  })

  it("printExport", async () => {
    const print = flow(Markdown.printExport, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.export)),
      `## test

**Signature**

\`\`\`ts
export declare const test: typeof test
\`\`\`

Added in v1.0.0
`
    )
  })

  it("printFunction", async () => {
    const print = flow(Markdown.printFunction, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.function)),
      `## ~~func~~

a function

**Signature**

\`\`\`ts
declare const func: (test: string) => string
\`\`\`

**Example**

\`\`\`ts
example 1
\`\`\`

Added in v1.0.0
`
    )
  })

  it("printInterface", async () => {
    const print = flow(Markdown.printInterface, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.interface, 0)),
      `## A (interface)

**Signature**

\`\`\`ts
export interface A extends Record<string, unknown> {}
\`\`\`

Added in v1.0.0
`
    )
  })

  it("printTypeAlias", async () => {
    const print = flow(Markdown.printTypeAlias, Markdown.prettify)
    assert.strictEqual(
      await Effect.runPromise(print(testCases.typeAlias, 0)),
      `## A (type alias)

**Signature**

\`\`\`ts
export type A = number
\`\`\`

Added in v1.0.0
`
    )

    assert.strictEqual(
      await Effect.runPromise(print({ ...testCases.typeAlias, since: Option.none() }, 0)),
      `## A (type alias)

**Signature**

\`\`\`ts
export type A = number
\`\`\`
`
    )
  })

  it("printModule", async () => {
    const doc = Domain.createNamedDoc(
      "tests",
      Option.none(),
      Option.some("1.0.0"),
      false,
      [],
      Option.none()
    )
    assert.strictEqual(
      await Effect.runPromise(Markdown.printModule(
        Domain.createModule(
          doc,
          ["src", "tests.ts"],
          [testCases.class],
          [testCases.interface],
          [testCases.function],
          [testCases.typeAlias],
          [testCases.constant],
          [testCases.export],
          [testCases.namespace]
        ),
        1
      )),
      `---
title: tests.ts
nav_order: 1
parent: Modules
---

## tests overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [category](#category)
  - [A (class)](#a-class)
    - [staticTest (static method)](#statictest-static-method)
    - [hasOwnProperty (function) (method)](#hasownproperty-function-method)
    - [foo (property)](#foo-property)
- [constants](#constants)
  - [test](#test)
- [utils](#utils)
  - [A (interface)](#a-interface)
  - [A (type alias)](#a-type-alias)
  - [A (namespace)](#a-namespace)
    - [B (type alias)](#b-type-alias)
    - [C (namespace)](#c-namespace)
      - [D (type alias)](#d-type-alias)
  - [~~func~~](#func)
  - [test](#test-1)

---

# category

## A (class)

a class

**Signature**

\`\`\`ts
declare class A {
  constructor()
}
\`\`\`

**Example**

\`\`\`ts
example 1
\`\`\`

Added in v1.0.0

### staticTest (static method)

**Signature**

\`\`\`ts
static testStatic(): string;
\`\`\`

Added in v1.0.0

### hasOwnProperty (function) (method)

**Signature**

\`\`\`ts
hasOwnProperty(): boolean
\`\`\`

Added in v1.0.0

### foo (property)

**Signature**

\`\`\`ts
foo: string
\`\`\`

Added in v1.0.0

# constants

## test

the test

**Signature**

\`\`\`ts
declare const test: string
\`\`\`

Added in v1.0.0

# utils

## A (interface)

**Signature**

\`\`\`ts
export interface A extends Record<string, unknown> {}
\`\`\`

Added in v1.0.0

## A (type alias)

**Signature**

\`\`\`ts
export type A = number
\`\`\`

Added in v1.0.0

## A (namespace)

Added in v1.0.0

### B (type alias)

**Signature**

\`\`\`ts
export type B = string
\`\`\`

Added in v1.0.1

### C (namespace)

Added in v1.0.2

#### D (type alias)

**Signature**

\`\`\`ts
export type D = number
\`\`\`

Added in v1.0.3

## ~~func~~

a function

**Signature**

\`\`\`ts
declare const func: (test: string) => string
\`\`\`

**Example**

\`\`\`ts
example 1
\`\`\`

Added in v1.0.0

## test

**Signature**

\`\`\`ts
export declare const test: typeof test
\`\`\`

Added in v1.0.0
`
    )

    const empty = Domain.createModule(doc, ["src", "tests.ts"], [], [], [], [], [], [], [])

    assert.strictEqual(
      await Effect.runPromise(Markdown.printModule(empty, 1)),
      `---
title: tests.ts
nav_order: 1
parent: Modules
---

## tests overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

---
`
    )
  })
})
