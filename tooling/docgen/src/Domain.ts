/**
 * @since 0.0.0
 */

import { $DocgenId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Layer, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as Parser from "./Parser.js";

const $I = $DocgenId.create("Domain");

const StringArray = S.Array(S.String);
const OptionalString = S.UndefinedOr(S.String);
const OptionalStringArray = S.UndefinedOr(StringArray);

/**
 * Represents a one-based source location in a parsed file.
 *
 * @category model
 * @since 0.0.0
 */
export class Position extends S.Class<Position>($I`Position`)({
  column: S.Number,
  line: S.Number,
}) {
  /**
   * Creates a source position from line and column coordinates.
   *
   * @param line - One-based line number.
   * @param column - One-based column number.
   * @returns Position instance for the provided coordinates.
   */
  static new(line: number, column: number): Position {
    return new Position({ column, line });
  }
}

/**
 * Represents normalized JSDoc metadata for a documented symbol.
 *
 * @category model
 * @since 0.0.0
 */
export class Doc extends S.Class<Doc>($I`Doc`)({
  description: OptionalString,
  since: StringArray,
  deprecated: StringArray,
  examples: StringArray,
  category: StringArray,
  throws: StringArray,
  sees: StringArray,
  tags: S.Record(S.String, OptionalStringArray),
}) {
  /**
   * Creates a normalized documentation record.
   *
   * @param description - Main description text when present.
   * @param since - `@since` tag values.
   * @param deprecated - `@deprecated` tag values.
   * @param examples - `@example` tag values.
   * @param category - `@category` tag values.
   * @param throws - `@throws` tag values.
   * @param sees - `@see` tag values.
   * @param tags - Raw grouped tag values.
   * @returns Doc model with array fields normalized.
   */
  static new(
    description: string | undefined,
    since: ReadonlyArray<string>,
    deprecated: ReadonlyArray<string>,
    examples: ReadonlyArray<string>,
    category: ReadonlyArray<string>,
    throws: ReadonlyArray<string>,
    sees: ReadonlyArray<string>,
    tags: Record<string, ReadonlyArray<string> | undefined>
  ): Doc {
    return new Doc({
      description,
      since: A.fromIterable(since),
      deprecated: A.fromIterable(deprecated),
      examples: A.fromIterable(examples),
      category: A.fromIterable(category),
      throws: A.fromIterable(throws),
      sees: A.fromIterable(sees),
      tags,
    });
  }

  /**
   * Returns a copy of the doc with a different description.
   *
   * @param description - Replacement description text.
   * @returns Doc instance with the updated description.
   */
  modifyDescription(description: string | undefined): Doc {
    return Doc.new(
      description,
      this.since,
      this.deprecated,
      this.examples,
      this.category,
      this.throws,
      this.sees,
      this.tags
    );
  }
}

/**
 * Represents a named documented API member with source and signature metadata.
 *
 * @category model
 * @since 0.0.0
 */
export class DocEntry extends S.Class<DocEntry>($I`DocEntry`)({
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  /**
   * Creates a documented entry for a named API member.
   *
   * @param name - Exported member name.
   * @param doc - Parsed documentation metadata.
   * @param signature - Printable signature for the member.
   * @param position - Source position for the member.
   * @returns Doc entry instance.
   */
  static new(name: string, doc: Doc, signature: string, position: Position): DocEntry {
    return new DocEntry({ name, doc, signature, position });
  }
}

/**
 * Represents a documented class and its emitted member structure.
 *
 * @category model
 * @since 0.0.0
 */
export class Class extends S.Class<Class>($I`Class`)({
  _tag: S.tag("Class"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
  methods: S.Array(DocEntry),
  staticMethods: S.Array(DocEntry),
  properties: S.Array(DocEntry),
}) {
  /**
   * Creates a documented class model.
   *
   * @param name - Identifier shown in generated docs for the class.
   * @param doc - Parsed class documentation.
   * @param signature - Printable class signature.
   * @param position - Source position for the class.
   * @param methods - Instance methods.
   * @param staticMethods - Static members collected from the class declaration.
   * @param properties - Documented properties.
   * @returns Class model instance.
   */
  static new(
    name: string,
    doc: Doc,
    signature: string,
    position: Position,
    methods: ReadonlyArray<DocEntry>,
    staticMethods: ReadonlyArray<DocEntry>,
    properties: ReadonlyArray<DocEntry>
  ): Class {
    return new Class({
      name,
      doc,
      signature,
      position,
      methods: A.fromIterable(methods),
      staticMethods: A.fromIterable(staticMethods),
      properties: A.fromIterable(properties),
    });
  }
}

/**
 * Represents a documented interface declaration.
 *
 * @category model
 * @since 0.0.0
 */
export class Interface extends S.Class<Interface>($I`Interface`)({
  _tag: S.tag("Interface"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  /**
   * Creates a documented interface model.
   *
   * @param name - Identifier shown in generated docs for the interface.
   * @param doc - Parsed interface documentation.
   * @param signature - Printable interface signature.
   * @param position - Source position for the interface.
   * @returns Interface model instance.
   */
  static new(name: string, doc: Doc, signature: string, position: Position): Interface {
    return new Interface({ name, doc, signature, position });
  }
}

/**
 * Represents a documented function declaration or function-valued export.
 *
 * @category model
 * @since 0.0.0
 */
export class Function extends S.Class<Function>($I`Function`)({
  _tag: S.tag("Function"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  /**
   * Creates a documented function model.
   *
   * @param name - Identifier shown in generated docs for the function.
   * @param doc - Parsed function documentation.
   * @param signature - Printable function signature.
   * @param position - Source position for the function.
   * @returns Function model instance.
   */
  static new(name: string, doc: Doc, signature: string, position: Position): Function {
    return new Function({ name, doc, signature, position });
  }
}

/**
 * Represents a documented type alias declaration.
 *
 * @category model
 * @since 0.0.0
 */
export class TypeAlias extends S.Class<TypeAlias>($I`TypeAlias`)({
  _tag: S.tag("TypeAlias"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  /**
   * Creates a documented type alias model.
   *
   * @param name - Identifier shown in generated docs for the type alias.
   * @param doc - Parsed type alias documentation.
   * @param signature - Printable type alias signature.
   * @param position - Source position for the type alias.
   * @returns Type alias model instance.
   */
  static new(name: string, doc: Doc, signature: string, position: Position): TypeAlias {
    return new TypeAlias({ name, doc, signature, position });
  }
}

/**
 * Represents a documented exported constant declaration.
 *
 * @category model
 * @since 0.0.0
 */
export class Constant extends S.Class<Constant>($I`Constant`)({
  _tag: S.tag("Constant"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  /**
   * Creates a documented constant model.
   *
   * @param name - Identifier shown in generated docs for the constant.
   * @param doc - Parsed constant documentation.
   * @param signature - Printable constant signature.
   * @param position - Source position for the constant.
   * @returns Constant model instance.
   */
  static new(name: string, doc: Doc, signature: string, position: Position): Constant {
    return new Constant({ name, doc, signature, position });
  }
}

/**
 * These are manual exports, like:
 *
 * ```ts skip-type-checking
 * const _null = ...
 *
 * export {
 * 
 * }
 * ```
 *
 * @category model
 * @since 0.0.0
 */
export class Export extends S.Class<Export>($I`Export`)({
  _tag: S.tag("Export"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
  isNamespaceExport: S.Boolean,
}) {
  /**
   * Creates a documented manual export model.
   *
   * @param name - Exported name.
   * @param doc - Parsed export documentation.
   * @param signature - Printable export signature.
   * @param position - Source position for the export.
   * @param isNamespaceExport - Whether the export re-exports a namespace.
   * @returns Export model instance.
   */
  static new(name: string, doc: Doc, signature: string, position: Position, isNamespaceExport: boolean): Export {
    return new Export({ name, doc, signature, position, isNamespaceExport });
  }
}

/**
 * Represents a documented namespace and its nested exported members.
 *
 * @category model
 * @since 0.0.0
 */
export class Namespace extends S.Class<Namespace>($I`Namespace`)({
  _tag: S.tag("Namespace"),
  name: S.String,
  doc: Doc,
  position: Position,
  interfaces: S.Array(Interface),
  typeAliases: S.Array(TypeAlias),
  namespaces: S.Array(S.Any),
}) {
  declare readonly namespaces: ReadonlyArray<Namespace>;

  /**
   * Creates a documented namespace model.
   *
   * @param name - Identifier shown in generated docs for the namespace.
   * @param doc - Parsed namespace documentation.
   * @param position - Source position for the namespace.
   * @param interfaces - Nested interfaces.
   * @param typeAliases - Nested type aliases.
   * @param namespaces - Nested namespaces.
   * @returns Namespace model instance.
   */
  static new(
    name: string,
    doc: Doc,
    position: Position,
    interfaces: ReadonlyArray<Interface>,
    typeAliases: ReadonlyArray<TypeAlias>,
    namespaces: ReadonlyArray<Namespace>
  ): Namespace {
    return new Namespace({
      name,
      doc,
      position,
      interfaces: A.fromIterable(interfaces),
      typeAliases: A.fromIterable(typeAliases),
      namespaces: A.fromIterable(namespaces),
    });
  }
}

/**
 * Represents a fully parsed module ready for validation and printing.
 *
 * @category model
 * @since 0.0.0
 */
export class Module extends S.Class<Module>($I`Module`)({
  source: S.Any,
  name: S.String,
  doc: Doc,
  path: S.Array(S.String),
  classes: S.Array(Class),
  interfaces: S.Array(Interface),
  functions: S.Array(Function),
  typeAliases: S.Array(TypeAlias),
  constants: S.Array(Constant),
  exports: S.Array(Export),
  namespaces: S.Array(Namespace),
}) {
  declare readonly source: Parser.SourceShape;

  /**
   * Creates a documented module model.
   *
   * @param source - Parsed source metadata.
   * @param name - Module display name.
   * @param doc - Parsed module documentation.
   * @param path - Path segments for the module.
   * @param classes - Documented classes.
   * @param interfaces - Documented interfaces.
   * @param functions - Documented functions.
   * @param typeAliases - Documented type aliases.
   * @param constants - Documented constants.
   * @param exports - Documented manual exports.
   * @param namespaces - Documented namespaces.
   * @returns Module model instance.
   */
  static new(
    source: Parser.SourceShape,
    name: string,
    doc: Doc,
    path: ReadonlyArray<string>,
    classes: ReadonlyArray<Class>,
    interfaces: ReadonlyArray<Interface>,
    functions: ReadonlyArray<Function>,
    typeAliases: ReadonlyArray<TypeAlias>,
    constants: ReadonlyArray<Constant>,
    exports: ReadonlyArray<Export>,
    namespaces: ReadonlyArray<Namespace>
  ): Module {
    return new Module({
      source,
      name,
      doc,
      path: A.fromIterable(path),
      classes: A.fromIterable(classes),
      interfaces: A.fromIterable(interfaces),
      functions: A.fromIterable(functions),
      typeAliases: A.fromIterable(typeAliases),
      constants: A.fromIterable(constants),
      exports: A.fromIterable(exports),
      namespaces: A.fromIterable(namespaces),
    });
  }
}

/**
 * A comparator function for sorting `Module` objects by their file path,
 * represented as a lowercase string.
 *
 * @category sorting
 * @since 0.0.0
 */
export const ByPath: Order.Order<Module> = Order.mapInput(Str.Order, (module: Module) =>
  pipe(module.path, A.join("/"), Str.toLowerCase)
);

/**
 * Represents a file which can be optionally overwritable.
 *
 * @category model
 * @since 0.0.0
 */
export class File extends S.Class<File>($I`File`)({
  path: S.String,
  content: S.String,
  isOverwritable: S.Boolean,
}) {
  /**
   * Creates an output file descriptor.
   *
   * @param path - Output file path.
   * @param content - Output file content.
   * @param isOverwritable - Whether existing content may be replaced.
   * @returns File descriptor instance.
   */
  static new(path: string, content: string, isOverwritable = false): File {
    return new File({ path, content, isOverwritable });
  }
}

/**
 * Unique symbol used to brand docgen-specific errors.
 *
 * @category symbol
 * @since 0.0.0
 */
export const DocgenErrorTypeId = Symbol.for("@beep/docgen/DocgenError");

/**
 * Type-level alias for the unique docgen error branding symbol.
 *
 * @category symbol
 * @since 0.0.0
 */
export type DocgenErrorTypeId = typeof DocgenErrorTypeId;

/**
 * Typed error used throughout docgen parsing and generation operations.
 *
 * @category model
 * @since 0.0.0
 */
export class DocgenError extends TaggedErrorClass<DocgenError>($I`DocgenError`)("DocgenError", { message: S.String }) {}

/**
 * Represents a handle to the currently executing process.
 *
 * @category service
 * @since 0.0.0
 */
type ProcessShape = {
  readonly argv: Effect.Effect<Array<string>>;
  readonly cwd: Effect.Effect<string>;
  readonly platform: Effect.Effect<string>;
};

const defaultProcess: ProcessShape = {
  cwd: Effect.sync(() => process.cwd()),
  platform: Effect.sync(() => process.platform),
  argv: Effect.sync(() => process.argv),
};

/**
 * Represents a handle to the currently executing process.
 *
 * @category service
 * @since 0.0.0
 */
export class Process extends Context.Service<Process, ProcessShape>()($I`Process`, {
  make: Effect.succeed(defaultProcess),
}) {
  static readonly layer = Layer.succeed(Process, Process.of(defaultProcess));
}
