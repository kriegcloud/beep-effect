/**
 *
 *
 * @module @beep/repo-cli/commands/DocgenV2/Domain
 * @since 0.0.0
 */

import {$RepoCliId} from "@beep/identity/packages";
import {JSDocCategory} from "@beep/repo-utils/JSDoc/JSDoc";
import {FilePath, SemanticVersion, SchemaUtils} from "@beep/schema";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as Str from "effect/String";
import {Order, flow} from "effect";
import {Struct, A} from "@beep/utils";

const $I = $RepoCliId.create("commands/DocgenV2/Domain");


/**
 * ExampleFence - A JSDoc `@example` fence
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ExampleFence extends S.Class<ExampleFence>($I`ExampleFence`)(
  {
    start: S.String,
    end: S.String,
  },
  $I.annote(
    "ExampleFence",
    {
      description: "ExampleFence - A JSDoc `@example` fence",
    }
  )
) {
}

/**
 * Example - A JSDoc typescript example
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Example extends S.Class<Example>($I`Example`)(
  {
    body: S.String,
    fences: S.OptionFromOptionalKey(ExampleFence)
  },
  $I.annote(
    "Example",
    {
      description: "Example - A JSDoc typescript example",
    }
  )
) {
}


/**
 * Doc - A JSDoc string
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Doc extends S.Class<Doc>($I`Doc`)(
  {
    description: S.Option(S.String),
    since: S.Option(SemanticVersion),
    deprecated: SchemaUtils.withKeyDefaults(
      S.Boolean,
      false
    ),
    examples: Example.pipe(S.Array),
    category: JSDocCategory.pipe(S.Option)
  },
  $I.annote(
    "Doc",
    {
      description: "Doc - A JSDoc string",
    }
  )
) {
}


/**
 * NamedDoc -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class NamedDoc extends Doc.extend<NamedDoc>($I`NamedDoc`)(
  {
    name: S.String,
  },
  $I.annote(
    "NamedDoc",
    {
      description: "NamedDoc -",
    }
  )
) {
}


/**
 * Method -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Method extends NamedDoc.extend<Method>($I`Method`)(
  {
    signatures: S.Array(S.String)
  },
  $I.annote(
    "Method",
    {
      description: "Method - ",
    }
  )
) {
}

/**
 * Property -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Property extends NamedDoc.extend<Property>($I`Property`)(
  {
    signature: S.String
  },
  $I.annote(
    "Property",
    {
      description: "Property - ",
    }
  )
) {
}

/**
 * Interface -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Interface extends NamedDoc.extend<Interface>($I`Interface`)(
  {
    _tag: S.tag("Interface"),
    signature: S.String,
  },
  $I.annote(
    "Interface",
    {
      description: "Interface - ",
    }
  )
) {
}

/**
 * Function -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Function extends NamedDoc.extend<Function>($I`Function`)(
  {
    _tag: S.tag("Function"),
    signatures: S.Array(S.String)
  },
  $I.annote(
    "Function",
    {
      description: "Function - ",
    }
  )
) {
}


/**
 * TypeAlias -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TypeAlias extends NamedDoc.extend<TypeAlias>($I`TypeAlias`)(
  {
    _tag: S.tag("TypeAlias"),
    signature: S.String,
  },
  $I.annote(
    "TypeAlias",
    {
      description: "TypeAlias - ",
    }
  )
) {
}

/**
 * Constant -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Constant extends NamedDoc.extend<Constant>($I`Constant`)(
  {
    _tag: S.tag("Constant"),
    signature: S.String,
  },
  $I.annote(
    "Constant",
    {
      description: "Constant - ",
    }
  )
) {
}

/**
 * Export -
 *
 * ```ts
 * const _null = ...
 *
 * export {
 *   _null as null
 * }
 * ```
 *
 * @category DomainModel
 * @since 1.0.0
 */
export class Export extends NamedDoc.extend<Export>($I`Export`)(
  {
    _tag: S.tag("Export"),
    signature: S.String,
  },
  $I.annote(
    "Export",
    {
      description: "Export - "
    }
  )
) {
}


/**
 * Namespace -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Namespace extends NamedDoc.extend<Namespace>($I`Namespace`)(
  {
    _tag: S.tag("Namespace"),
    interfaces: S.Array(Interface),
    typeAliases: S.Array(TypeAlias),
    namespaces: S.Array(S.suspend((): S.Schema<NamedDoc & {
      readonly _tag: "Namespace",
      readonly interfaces: ReadonlyArray<Interface>
      readonly typeAliases: ReadonlyArray<TypeAlias>
      readonly namespaces: ReadonlyArray<Namespace>
    }> => Namespace)),
  },
  $I.annote(
    "Namespace",
    {
      description: "Namespace - ",
    }
  )
) {
}


/**
 * Class -
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Class extends NamedDoc.extend<Class>($I`Class`)(
  {
    _tag: S.tag("Class"),
    signature: S.String,
    methods: S.Array(Method),
    staticMethods: S.Array(Method),
    properties: S.Array(Property)
  },
  $I.annote(
    "Class",
    {
      description: "Class - ",
    }
  )
) {
}


// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 *
 * @category
 * @since 0.0.0
 */
export const createDoc = (
  description: O.Option<string>,
  since: O.Option<SemanticVersion>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: O.Option<JSDocCategory>
): Doc => new Doc({
  description,
  since,
  deprecated,
  examples,
  category
});

/**
 *
 * @category
 * @since 0.0.0
 */
export const createNamedDoc = (
  name: string,
  description: O.Option<string>,
  since: O.Option<SemanticVersion>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: O.Option<JSDocCategory>
): NamedDoc => new NamedDoc({
  name,
  description,
  since,
  deprecated,
  examples,
  category
});

/**
 * Module - A typescript module.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Module extends NamedDoc.extend<Module>($I`Module`)(
  {
    path: FilePath.pipe(S.Array),
    classes: S.Array(Class),
    interfaces: S.Array(Interface),
    functions: S.Array(Function),
    typeAliases: S.Array(TypeAlias),
    constants: S.Array(Constant),
    exports: S.Array(Export),
    namespaces: S.Array(Namespace)
  },
  $I.annote(
    "Module",
    {
      description: "Module - A typescript module.",
    }
  )
) {
}

/**
 *
 * @category
 * @since 0.0.0
 */
export const createModule = (
  doc: NamedDoc,
  path: ReadonlyArray<FilePath>,
  classes: ReadonlyArray<Class>,
  interfaces: ReadonlyArray<Interface>,
  functions: ReadonlyArray<Function>,
  typeAliases: ReadonlyArray<TypeAlias>,
  constants: ReadonlyArray<Constant>,
  exports: ReadonlyArray<Export>,
  namespaces: ReadonlyArray<Namespace>
): Module => new Module({
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


export const createClass = (
  doc: NamedDoc,
  signature: string,
  methods: ReadonlyArray<Method>,
  staticMethods: ReadonlyArray<Method>,
  properties: ReadonlyArray<Property>
): Class => new Class({
  ...doc,
  signature,
  methods,
  staticMethods,
  properties
});


export const createConstant = (
  doc: NamedDoc,
  signature: string,
): Constant => new Constant({
  ...doc,
  signature
})

export const createMethod = (
  doc: NamedDoc,
  signatures: ReadonlyArray<string>,
): Method => new Method({
  ...doc,
  signatures,
})

export const createProperty = (
  doc: NamedDoc,
  signature: string,
): Property => new Property({
  ...doc,
  signature,
})


export const createInterface = (
  doc: NamedDoc,
  signature: string,
): Interface => new Interface({
  ...doc,
  signature,
})

export const createFunction = (
  doc: NamedDoc,
  signatures: ReadonlyArray<string>,
): Function => new Function({
  ...doc,
  signatures,
})

export const createTypeAlias = (
  doc: NamedDoc,
  signature: string,
): TypeAlias => new TypeAlias({
  ...doc,
  signature,
})


export const createExport = (
  doc: NamedDoc,
  signature: string,
): Export => new Export({
  ...doc,
  signature,
})


export const createNamespace = (
  doc: NamedDoc,
  interfaces: ReadonlyArray<Interface>,
  typeAliases: ReadonlyArray<TypeAlias>,
  namespaces: ReadonlyArray<Namespace>
): Namespace => new Namespace({
  ...doc,
  interfaces,
  typeAliases,
  namespaces
})

/**
 * A comparator function for sorting `Module` objects by their file path, represented as a string.
 * The file path is converted to lowercase before comparison.
 *
 * @category Utility
 * @since 1.0.0
 */
export const ByPath: Order.Order<Module> = Order.mapInput(
  Str.Order,
  flow(
    Struct.get("path"),
    A.join("/"),
    Str.toLowerCase
  )
)
