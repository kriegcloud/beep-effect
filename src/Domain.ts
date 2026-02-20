/**
 * @since 0.6.0
 */

import type * as Array from "effect/Array"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Order from "effect/Order"
import * as String from "effect/String"
import type * as Parser from "./Parser.js"

/**
 * @category model
 * @since 0.6.0
 */
export class DocEntry {
  constructor(
    readonly name: string,
    readonly doc: Doc,
    readonly signature: string,
    readonly position: Position
  ) {}
}

/**
 * @category model
 * @since 0.6.0
 */
export class Doc {
  constructor(
    readonly description: string | undefined,
    readonly since: ReadonlyArray<string>,
    readonly deprecated: ReadonlyArray<string>,
    readonly examples: ReadonlyArray<string>,
    readonly category: ReadonlyArray<string>,
    readonly throws: ReadonlyArray<string>,
    readonly sees: ReadonlyArray<string>,
    readonly tags: Record<string, ReadonlyArray<string> | undefined>
  ) {}

  modifyDescription(description: string | undefined): Doc {
    return new Doc(
      description,
      this.since,
      this.deprecated,
      this.examples,
      this.category,
      this.throws,
      this.sees,
      this.tags
    )
  }
}

/**
 * @category model
 * @since 0.6.0
 */
export class Module {
  constructor(
    readonly source: Parser.SourceShape,
    readonly name: string,
    readonly doc: Doc,
    readonly path: Array.NonEmptyReadonlyArray<string>,
    readonly classes: ReadonlyArray<Class>,
    readonly interfaces: ReadonlyArray<Interface>,
    readonly functions: ReadonlyArray<Function>,
    readonly typeAliases: ReadonlyArray<TypeAlias>,
    readonly constants: ReadonlyArray<Constant>,
    readonly exports: ReadonlyArray<Export>,
    readonly namespaces: ReadonlyArray<Namespace>
  ) {}
}

/**
 * @category model
 * @since 0.6.0
 */
export class Class extends DocEntry {
  readonly _tag = "Class"
  constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position,
    readonly methods: ReadonlyArray<DocEntry>,
    readonly staticMethods: ReadonlyArray<DocEntry>,
    readonly properties: ReadonlyArray<DocEntry>
  ) {
    super(name, doc, signature, position)
  }
}

/**
 * @category model
 * @since 0.6.0
 */
export class Interface extends DocEntry {
  readonly _tag = "Interface"
  constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position
  ) {
    super(name, doc, signature, position)
  }
}

/**
 * @category model
 * @since 0.6.0
 */
export interface Position {
  readonly line: number
  readonly column: number
}

/**
 * @category model
 * @since 0.6.0
 */
export class Function extends DocEntry {
  readonly _tag = "Function"
  constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position
  ) {
    super(name, doc, signature, position)
  }
}

/**
 * @category model
 * @since 0.6.0
 */
export class TypeAlias extends DocEntry {
  readonly _tag = "TypeAlias"
  constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position
  ) {
    super(name, doc, signature, position)
  }
}

/**
 * @category model
 * @since 0.6.0
 */
export class Constant extends DocEntry {
  readonly _tag = "Constant"
  constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position
  ) {
    super(name, doc, signature, position)
  }
}

/**
 * These are manual exports, like:
 *
 * ```ts skip-type-checking
 * const _null = ...
 *
 * export {
 *   _null as null
 * }
 * ```
 *
 * @category model
 * @since 0.6.0
 */
export class Export extends DocEntry {
  readonly _tag = "Export"
  constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position,
    readonly isNamespaceExport: boolean
  ) {
    super(name, doc, signature, position)
  }
}

/**
 * @category model
 * @since 0.6.0
 */
export class Namespace {
  readonly _tag = "Namespace"
  constructor(
    readonly name: string,
    readonly doc: Doc,
    readonly position: Position,
    readonly interfaces: ReadonlyArray<Interface>,
    readonly typeAliases: ReadonlyArray<TypeAlias>,
    readonly namespaces: ReadonlyArray<Namespace>
  ) {}
}

/**
 * A comparator function for sorting `Module` objects by their file path, represented as a string.
 * The file path is converted to lowercase before comparison.
 *
 * @category sorting
 * @since 0.6.0
 */
export const ByPath: Order.Order<Module> = Order.mapInput(
  String.Order,
  (module: Module) => module.path.join("/").toLowerCase()
)

/**
 * Represents a file which can be optionally overwriteable.
 *
 * @category model
 * @since 0.6.0
 */
export class File {
  constructor(
    readonly path: string,
    readonly content: string,
    readonly isOverwriteable: boolean = false
  ) {}
}

/**
 * @category symbol
 * @since 0.6.0
 */
export const DocgenErrorTypeId = Symbol.for("@effect/docgen/DocgenError")

/**
 * @category symbol
 * @since 0.6.0
 */
export type DocgenErrorTypeId = typeof DocgenErrorTypeId

/**
 * @category model
 * @since 0.6.0
 */
export class DocgenError extends Data.TaggedError("DocgenError")<{
  readonly message: string
}> {}

/**
 * Represents a handle to the currently executing process.
 *
 * @category service
 * @since 0.6.0
 */
export class Process extends Effect.Service<Process>()("Process", {
  succeed: {
    cwd: Effect.sync(() => process.cwd()),
    platform: Effect.sync(() => process.platform),
    argv: Effect.sync(() => process.argv)
  }
}) {}
