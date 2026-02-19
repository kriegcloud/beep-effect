/**
 * @since 1.0.0
 */

import type * as Option from "effect/Option"
import * as Order from "effect/Order"
import * as String from "effect/String"

/**
 * @category model
 * @since 1.0.0
 */
export interface Module extends NamedDoc {
  readonly path: ReadonlyArray<string>
  readonly classes: ReadonlyArray<Class>
  readonly interfaces: ReadonlyArray<Interface>
  readonly functions: ReadonlyArray<Function>
  readonly typeAliases: ReadonlyArray<TypeAlias>
  readonly constants: ReadonlyArray<Constant>
  readonly exports: ReadonlyArray<Export>
  readonly namespaces: ReadonlyArray<Namespace>
}

/**
 * @category model
 * @since 1.0.0
 */
export type Example = {
  body: string
  fences?: {
    start: string
    end: string
  }
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Doc {
  readonly description: Option.Option<string>
  readonly since: Option.Option<string>
  readonly deprecated: boolean
  readonly examples: ReadonlyArray<Example>
  readonly category: Option.Option<string>
}

/**
 * @category model
 * @since 1.0.0
 */
export interface NamedDoc extends Doc {
  readonly name: string
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Class extends NamedDoc {
  readonly _tag: "Class"
  readonly signature: string
  readonly methods: ReadonlyArray<Method>
  readonly staticMethods: ReadonlyArray<Method>
  readonly properties: ReadonlyArray<Property>
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Method extends NamedDoc {
  readonly signatures: ReadonlyArray<string>
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Property extends NamedDoc {
  readonly signature: string
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Interface extends NamedDoc {
  readonly _tag: "Interface"
  readonly signature: string
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Function extends NamedDoc {
  readonly _tag: "Function"
  readonly signatures: ReadonlyArray<string>
}

/**
 * @category model
 * @since 1.0.0
 */
export interface TypeAlias extends NamedDoc {
  readonly _tag: "TypeAlias"
  readonly signature: string
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Constant extends NamedDoc {
  readonly _tag: "Constant"
  readonly signature: string
}

/**
 * These are manual exports, like:
 *
 * ```ts
 * const _null = ...
 *
 * export {
 *   _null as null
 * }
 * ```
 *
 * @category model
 * @since 1.0.0
 */
export interface Export extends NamedDoc {
  readonly _tag: "Export"
  readonly signature: string
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Namespace extends NamedDoc {
  readonly _tag: "Namespace"
  readonly interfaces: ReadonlyArray<Interface>
  readonly typeAliases: ReadonlyArray<TypeAlias>
  readonly namespaces: ReadonlyArray<Namespace>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 1.0.0
 */
export const createDoc = (
  description: Option.Option<string>,
  since: Option.Option<string>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: Option.Option<string>
): Doc => ({ description, since, deprecated, examples, category })

/**
 * @category constructors
 * @since 1.0.0
 */
export const createNamedDoc = (
  name: string,
  description: Option.Option<string>,
  since: Option.Option<string>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: Option.Option<string>
): NamedDoc => ({ name, description, since, deprecated, examples, category })

/**
 * @category constructors
 * @since 1.0.0
 */
export const createModule = (
  doc: NamedDoc,
  path: ReadonlyArray<string>,
  classes: ReadonlyArray<Class>,
  interfaces: ReadonlyArray<Interface>,
  functions: ReadonlyArray<Function>,
  typeAliases: ReadonlyArray<TypeAlias>,
  constants: ReadonlyArray<Constant>,
  exports: ReadonlyArray<Export>,
  namespaces: ReadonlyArray<Namespace>
): Module => ({
  ...doc,
  path,
  classes,
  interfaces,
  functions,
  typeAliases,
  constants,
  exports,
  namespaces
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createClass = (
  doc: NamedDoc,
  signature: string,
  methods: ReadonlyArray<Method>,
  staticMethods: ReadonlyArray<Method>,
  properties: ReadonlyArray<Property>
): Class => ({ _tag: "Class", ...doc, signature, methods, staticMethods, properties })

/**
 * @category constructors
 * @since 1.0.0
 */
export const createConstant = (doc: NamedDoc, signature: string): Constant => ({
  _tag: "Constant",
  ...doc,
  signature
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createMethod = (doc: NamedDoc, signatures: ReadonlyArray<string>): Method => ({
  ...doc,
  signatures
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createProperty = (doc: NamedDoc, signature: string): Property => ({
  ...doc,
  signature
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createInterface = (doc: NamedDoc, signature: string): Interface => ({
  _tag: "Interface",
  ...doc,
  signature
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createFunction = (doc: NamedDoc, signatures: ReadonlyArray<string>): Function => ({
  _tag: "Function",
  ...doc,
  signatures
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createTypeAlias = (doc: NamedDoc, signature: string): TypeAlias => ({
  _tag: "TypeAlias",
  ...doc,
  signature
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createExport = (doc: NamedDoc, signature: string): Export => ({
  _tag: "Export",
  ...doc,
  signature
})

/**
 * @category constructors
 * @since 1.0.0
 */
export const createNamespace = (
  doc: NamedDoc,
  interfaces: ReadonlyArray<Interface>,
  typeAliases: ReadonlyArray<TypeAlias>,
  namespaces: ReadonlyArray<Namespace>
): Namespace => ({ _tag: "Namespace", ...doc, interfaces, typeAliases, namespaces })

/**
 * A comparator function for sorting `Module` objects by their file path, represented as a string.
 * The file path is converted to lowercase before comparison.
 *
 * @category sorting
 * @since 1.0.0
 */
export const ByPath: Order.Order<Module> = Order.mapInput(
  String.Order,
  (module: Module) => module.path.join("/").toLowerCase()
)
