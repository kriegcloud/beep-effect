/**
 * @module @beep/repo-cli/commands/DocgenV2/Domain
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { type Category, Category as CategorySchema } from "@beep/repo-utils/JSDoc/models/index";
import { SchemaUtils, SemanticVersion } from "@beep/schema";
import { A, Struct } from "@beep/utils";
import { flow, Order } from "effect";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RepoCliId.create("commands/DocgenV2/Domain");

/**
 * Captures the opening and closing fence markers from a parsed `@example` block.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ExampleFence extends S.Class<ExampleFence>($I`ExampleFence`)(
  {
    start: S.String,
    end: S.String,
  },
  $I.annote("ExampleFence", {
    description: "Captures the opening and closing fence markers from a parsed `@example` block.",
  })
) {}

/**
 * Stores a parsed `@example` body together with any explicit fence markers.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Example extends S.Class<Example>($I`Example`)(
  {
    body: S.String,
    fences: S.OptionFromOptionalKey(ExampleFence),
  },
  $I.annote("Example", {
    description: "Stores a parsed `@example` body together with any explicit fence markers.",
  })
) {}

/**
 * Normalizes the shared documentation metadata extracted from a JSDoc block.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Doc extends S.Class<Doc>($I`Doc`)(
  {
    description: S.Option(S.String),
    since: S.Option(SemanticVersion),
    deprecated: SchemaUtils.withKeyDefaults(S.Boolean, false),
    examples: Example.pipe(S.Array),
    category: CategorySchema.pipe(S.Option),
  },
  $I.annote("Doc", {
    description: "Normalizes the shared documentation metadata extracted from a JSDoc block.",
  })
) {}

/**
 * Extends `Doc` with the export name that the documentation belongs to.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class NamedDoc extends Doc.extend<NamedDoc>($I`NamedDoc`)(
  {
    name: S.String,
  },
  $I.annote("NamedDoc", {
    description: "Extends `Doc` with the export name that the documentation belongs to.",
  })
) {}

/**
 * Describes a documented method and the declaration signatures that DocgenV2 renders for it.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Method extends NamedDoc.extend<Method>($I`Method`)(
  {
    signatures: S.Array(S.String),
  },
  $I.annote("Method", {
    description: "Describes a documented method and the declaration signatures that DocgenV2 renders for it.",
  })
) {}

/**
 * Describes a documented property and the declaration signature rendered for it.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Property extends NamedDoc.extend<Property>($I`Property`)(
  {
    signature: S.String,
  },
  $I.annote("Property", {
    description: "Describes a documented property and the declaration signature rendered for it.",
  })
) {}

/**
 * Represents a documented TypeScript interface export.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Interface extends NamedDoc.extend<Interface>($I`Interface`)(
  {
    _tag: S.tag("Interface"),
    signature: S.String,
  },
  $I.annote("Interface", {
    description: "Represents a documented TypeScript interface export.",
  })
) {}

/**
 * Represents a documented function export or function-like variable declaration.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Function extends NamedDoc.extend<Function>($I`Function`)(
  {
    _tag: S.tag("Function"),
    signatures: S.Array(S.String),
  },
  $I.annote("Function", {
    description: "Represents a documented function export or function-like variable declaration.",
  })
) {}

/**
 * Represents a documented type alias export.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TypeAlias extends NamedDoc.extend<TypeAlias>($I`TypeAlias`)(
  {
    _tag: S.tag("TypeAlias"),
    signature: S.String,
  },
  $I.annote("TypeAlias", {
    description: "Represents a documented type alias export.",
  })
) {}

/**
 * Represents a documented constant export.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Constant extends NamedDoc.extend<Constant>($I`Constant`)(
  {
    _tag: S.tag("Constant"),
    signature: S.String,
  },
  $I.annote("Constant", {
    description: "Represents a documented constant export.",
  })
) {}

/**
 * Represents a documented re-export entry.
 *
 * ```ts
 * const internalValue = 1
 *
 * export {
 *   internalValue as exportedValue
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
  $I.annote("Export", {
    description: "Represents a documented re-export entry.",
  })
) {}

/**
 * Represents a documented namespace export and its nested members.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Namespace extends NamedDoc.extend<Namespace>($I`Namespace`)(
  {
    _tag: S.tag("Namespace"),
    interfaces: S.Array(Interface),
    typeAliases: S.Array(TypeAlias),
    namespaces: S.Array(
      S.suspend(
        (): S.Schema<
          NamedDoc & {
            readonly _tag: "Namespace";
            readonly interfaces: ReadonlyArray<Interface>;
            readonly typeAliases: ReadonlyArray<TypeAlias>;
            readonly namespaces: ReadonlyArray<Namespace>;
          }
        > => Namespace
      )
    ),
  },
  $I.annote("Namespace", {
    description: "Represents a documented namespace export and its nested members.",
  })
) {}

/**
 * Represents a documented class export and the members rendered for it.
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
    properties: S.Array(Property),
  },
  $I.annote("Class", {
    description: "Represents a documented class export and the members rendered for it.",
  })
) {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Creates a normalized documentation payload from parsed JSDoc fields.
 *
 * @param description The optional prose description from the JSDoc block.
 * @param since The optional semantic version declared by `@since`.
 * @param deprecated Whether the documented symbol is marked as deprecated.
 * @param examples The parsed example blocks attached to the symbol.
 * @param category The optional category derived from the JSDoc tags.
 * @returns A normalized `Doc` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createDoc = (
  description: O.Option<string>,
  since: O.Option<SemanticVersion>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: O.Option<Category>
): Doc =>
  new Doc({
    description,
    since,
    deprecated,
    examples,
    category,
  });

/**
 * Creates a named documentation payload for a single exported symbol.
 *
 * @param name The exported symbol name.
 * @param description The optional prose description from the JSDoc block.
 * @param since The optional semantic version declared by `@since`.
 * @param deprecated Whether the documented symbol is marked as deprecated.
 * @param examples The parsed example blocks attached to the symbol.
 * @param category The optional category derived from the JSDoc tags.
 * @returns A normalized `NamedDoc` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createNamedDoc = (
  name: string,
  description: O.Option<string>,
  since: O.Option<SemanticVersion>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: O.Option<Category>
): NamedDoc =>
  new NamedDoc({
    name,
    description,
    since,
    deprecated,
    examples,
    category,
  });

/**
 * Represents a parsed module together with the documented exports that belong to it.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Module extends NamedDoc.extend<Module>($I`Module`)(
  {
    path: S.Array(S.String),
    classes: S.Array(Class),
    interfaces: S.Array(Interface),
    functions: S.Array(Function),
    typeAliases: S.Array(TypeAlias),
    constants: S.Array(Constant),
    exports: S.Array(Export),
    namespaces: S.Array(Namespace),
  },
  $I.annote("Module", {
    description: "Represents a parsed module together with the documented exports that belong to it.",
  })
) {}

/**
 * Creates a parsed module model and attaches its documented exports.
 *
 * @param doc The module-level documentation metadata.
 * @param path The path segments that identify the module file.
 * @param classes The documented classes exported by the module.
 * @param interfaces The documented interfaces exported by the module.
 * @param functions The documented functions exported by the module.
 * @param typeAliases The documented type aliases exported by the module.
 * @param constants The documented constants exported by the module.
 * @param exports The documented re-exports from the module.
 * @param namespaces The documented nested namespaces exported by the module.
 * @returns A normalized `Module` model.
 * @category Constructors
 * @since 0.0.0
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
): Module =>
  new Module({
    ...doc,
    path,
    classes,
    interfaces,
    functions,
    typeAliases,
    constants,
    exports,
    namespaces,
  });

/**
 * Creates a documented class model.
 *
 * @param doc The shared documentation fields for the class.
 * @param signature The rendered class declaration signature.
 * @param methods The instance methods to render.
 * @param staticMethods The static methods to render.
 * @param properties The instance properties to render.
 * @returns A normalized `Class` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createClass = (
  doc: NamedDoc,
  signature: string,
  methods: ReadonlyArray<Method>,
  staticMethods: ReadonlyArray<Method>,
  properties: ReadonlyArray<Property>
): Class =>
  new Class({
    ...doc,
    signature,
    methods,
    staticMethods,
    properties,
  });

/**
 * Creates a documented constant model.
 *
 * @param doc The shared documentation fields for the constant.
 * @param signature The rendered constant declaration signature.
 * @returns A normalized `Constant` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createConstant = (doc: NamedDoc, signature: string): Constant =>
  new Constant({
    ...doc,
    signature,
  });

/**
 * Creates a documented method model.
 *
 * @param doc The shared documentation fields for the method.
 * @param signatures The rendered declaration signatures for the method.
 * @returns A normalized `Method` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createMethod = (doc: NamedDoc, signatures: ReadonlyArray<string>): Method =>
  new Method({
    ...doc,
    signatures,
  });

/**
 * Creates a documented property model.
 *
 * @param doc The shared documentation fields for the property.
 * @param signature The rendered property declaration signature.
 * @returns A normalized `Property` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createProperty = (doc: NamedDoc, signature: string): Property =>
  new Property({
    ...doc,
    signature,
  });

/**
 * Creates a documented interface model.
 *
 * @param doc The shared documentation fields for the interface.
 * @param signature The rendered interface declaration signature.
 * @returns A normalized `Interface` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createInterface = (doc: NamedDoc, signature: string): Interface =>
  new Interface({
    ...doc,
    signature,
  });

/**
 * Creates a documented function model.
 *
 * @param doc The shared documentation fields for the function.
 * @param signatures The rendered declaration signatures for the function.
 * @returns A normalized `Function` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createFunction = (doc: NamedDoc, signatures: ReadonlyArray<string>): Function =>
  new Function({
    ...doc,
    signatures,
  });

/**
 * Creates a documented type alias model.
 *
 * @param doc The shared documentation fields for the type alias.
 * @param signature The rendered type alias declaration signature.
 * @returns A normalized `TypeAlias` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createTypeAlias = (doc: NamedDoc, signature: string): TypeAlias =>
  new TypeAlias({
    ...doc,
    signature,
  });

/**
 * Creates a documented re-export model.
 *
 * @param doc The shared documentation fields for the re-export.
 * @param signature The rendered re-export declaration signature.
 * @returns A normalized `Export` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createExport = (doc: NamedDoc, signature: string): Export =>
  new Export({
    ...doc,
    signature,
  });

/**
 * Creates a documented namespace model.
 *
 * @param doc The shared documentation fields for the namespace.
 * @param interfaces The interfaces nested inside the namespace.
 * @param typeAliases The type aliases nested inside the namespace.
 * @param namespaces The child namespaces nested inside the namespace.
 * @returns A normalized `Namespace` model.
 * @category Constructors
 * @since 0.0.0
 */
export const createNamespace = (
  doc: NamedDoc,
  interfaces: ReadonlyArray<Interface>,
  typeAliases: ReadonlyArray<TypeAlias>,
  namespaces: ReadonlyArray<Namespace>
): Namespace =>
  new Namespace({
    ...doc,
    interfaces,
    typeAliases,
    namespaces,
  });

/**
 * A comparator function for sorting `Module` objects by their file path, represented as a string.
 * The file path is converted to lowercase before comparison.
 *
 * @category Utility
 * @since 1.0.0
 */
export const ByPath: Order.Order<Module> = Order.mapInput(
  Str.Order,
  flow(Struct.get("path"), A.join("/"), Str.toLowerCase)
);
