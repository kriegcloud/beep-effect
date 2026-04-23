/**
 * Domain models shared by docgen parsing, checking, and printing.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DocgenId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Layer, Order, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as Parser from "./Parser.js";

const $I = $DocgenId.create("Domain");

const StringArray = S.Array(S.String);
const OptionalString = S.UndefinedOr(S.String);
const OptionalStringArray = S.UndefinedOr(StringArray);

type DocNewOptions = {
  readonly since: ReadonlyArray<string>;
  readonly deprecated: ReadonlyArray<string>;
  readonly examples: ReadonlyArray<string>;
  readonly category: ReadonlyArray<string>;
  readonly throws: ReadonlyArray<string>;
  readonly sees: ReadonlyArray<string>;
  readonly tags: Record<string, ReadonlyArray<string> | undefined>;
};

type SignaturePositionOptions = {
  readonly signature: string;
  readonly position: Position;
};

type ClassNewOptions = SignaturePositionOptions & {
  readonly methods: ReadonlyArray<DocEntry>;
  readonly staticMethods: ReadonlyArray<DocEntry>;
  readonly properties: ReadonlyArray<DocEntry>;
};

type ExportNewOptions = SignaturePositionOptions & {
  readonly isNamespaceExport: boolean;
};

type NamespaceNewOptions = {
  readonly position: Position;
  readonly interfaces: ReadonlyArray<Interface>;
  readonly typeAliases: ReadonlyArray<TypeAlias>;
  readonly namespaces: ReadonlyArray<Namespace>;
};

type ModuleNewOptions = {
  readonly doc: Doc;
  readonly path: ReadonlyArray<string>;
  readonly classes: ReadonlyArray<Class>;
  readonly interfaces: ReadonlyArray<Interface>;
  readonly functions: ReadonlyArray<Function>;
  readonly typeAliases: ReadonlyArray<TypeAlias>;
  readonly constants: ReadonlyArray<Constant>;
  readonly exports: ReadonlyArray<Export>;
  readonly namespaces: ReadonlyArray<Namespace>;
};

/**
 * Represents a one-based source location in a parsed file.
 *
 * @example
 * ```ts
 * import { Position } from "@beep/docgen/Domain"
 * const position = Position.new(1, 1)
 * void position
 * ```
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
  static readonly new: {
    (line: number, column: number): Position;
    (column: number): (line: number) => Position;
  } = dual(2, (line: number, column: number): Position => new Position({ column, line }));
}

/**
 * Represents normalized JSDoc metadata for a documented symbol.
 *
 * @example
 * ```ts
 * import { Doc } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * void doc
 * ```
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
   * @param options - Normalized JSDoc tag values.
   * @returns Doc model with array fields normalized.
   */
  static readonly new: {
    (description: string | undefined, options: DocNewOptions): Doc;
    (options: DocNewOptions): (description: string | undefined) => Doc;
  } = dual(2, (description: string | undefined, options: DocNewOptions): Doc => {
    return new Doc({
      description,
      since: A.fromIterable(options.since),
      deprecated: A.fromIterable(options.deprecated),
      examples: A.fromIterable(options.examples),
      category: A.fromIterable(options.category),
      throws: A.fromIterable(options.throws),
      sees: A.fromIterable(options.sees),
      tags: options.tags,
    });
  });

  /**
   * Returns a copy of the doc with a different description.
   *
   * @param description - Replacement description text.
   * @returns Doc instance with the updated description.
   */
  modifyDescription(description: string | undefined): Doc {
    return Doc.new(description, {
      since: this.since,
      deprecated: this.deprecated,
      examples: this.examples,
      category: this.category,
      throws: this.throws,
      sees: this.sees,
      tags: this.tags,
    });
  }
}

/**
 * Represents a named documented API member with source and signature metadata.
 *
 * @example
 * ```ts
 * import { Doc, DocEntry, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const entry = DocEntry.new("Example", doc, {
 *   signature: "declare const Example: string",
 *   position: Position.new(1, 1)
 * })
 * void entry
 * ```
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
   * @param options - Printable signature and source position for the member.
   * @returns Doc entry instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: SignaturePositionOptions): DocEntry;
    (doc: Doc, options: SignaturePositionOptions): (name: string) => DocEntry;
  } = dual(3, (name: string, doc: Doc, options: SignaturePositionOptions): DocEntry => {
    return new DocEntry({ name, doc, signature: options.signature, position: options.position });
  });
}

/**
 * Represents a documented class and its emitted member structure.
 *
 * @example
 * ```ts
 * import { Class, Doc, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Class.new("Example", doc, {
 *   signature: "declare class Example",
 *   position: Position.new(1, 1),
 *   methods: [],
 *   staticMethods: [],
 *   properties: []
 * })
 * void model
 * ```
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
   * @param options - Printable signature, source position, and member entries.
   * @returns Class model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: ClassNewOptions): Class;
    (doc: Doc, options: ClassNewOptions): (name: string) => Class;
  } = dual(3, (name: string, doc: Doc, options: ClassNewOptions): Class => {
    return new Class({
      name,
      doc,
      signature: options.signature,
      position: options.position,
      methods: A.fromIterable(options.methods),
      staticMethods: A.fromIterable(options.staticMethods),
      properties: A.fromIterable(options.properties),
    });
  });
}

/**
 * Represents a documented interface declaration.
 *
 * @example
 * ```ts
 * import { Doc, Interface, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Interface.new("Example", doc, {
 *   signature: "interface Example {}",
 *   position: Position.new(1, 1)
 * })
 * void model
 * ```
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
   * @param options - Printable signature and source position for the interface.
   * @returns Interface model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: SignaturePositionOptions): Interface;
    (doc: Doc, options: SignaturePositionOptions): (name: string) => Interface;
  } = dual(3, (name: string, doc: Doc, options: SignaturePositionOptions): Interface => {
    return new Interface({ name, doc, signature: options.signature, position: options.position });
  });
}

/**
 * Represents a documented function declaration or function-valued export.
 *
 * @example
 * ```ts
 * import { Doc, Function, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Function.new("example", doc, {
 *   signature: "declare const example: () => void",
 *   position: Position.new(1, 1)
 * })
 * void model
 * ```
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
   * @param options - Printable signature and source position for the function.
   * @returns Function model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: SignaturePositionOptions): Function;
    (doc: Doc, options: SignaturePositionOptions): (name: string) => Function;
  } = dual(3, (name: string, doc: Doc, options: SignaturePositionOptions): Function => {
    return new Function({ name, doc, signature: options.signature, position: options.position });
  });
}

/**
 * Represents a documented type alias declaration.
 *
 * @example
 * ```ts
 * import { Doc, Position, TypeAlias } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = TypeAlias.new("Example", doc, {
 *   signature: "type Example = string",
 *   position: Position.new(1, 1)
 * })
 * void model
 * ```
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
   * @param options - Printable signature and source position for the type alias.
   * @returns Type alias model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: SignaturePositionOptions): TypeAlias;
    (doc: Doc, options: SignaturePositionOptions): (name: string) => TypeAlias;
  } = dual(3, (name: string, doc: Doc, options: SignaturePositionOptions): TypeAlias => {
    return new TypeAlias({ name, doc, signature: options.signature, position: options.position });
  });
}

/**
 * Represents a documented exported constant declaration.
 *
 * @example
 * ```ts
 * import { Constant, Doc, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Constant.new("example", doc, {
 *   signature: "declare const example: string",
 *   position: Position.new(1, 1)
 * })
 * void model
 * ```
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
   * @param options - Printable signature and source position for the constant.
   * @returns Constant model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: SignaturePositionOptions): Constant;
    (doc: Doc, options: SignaturePositionOptions): (name: string) => Constant;
  } = dual(3, (name: string, doc: Doc, options: SignaturePositionOptions): Constant => {
    return new Constant({ name, doc, signature: options.signature, position: options.position });
  });
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
 * @example
 * ```ts
 * import { Doc, Export, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Export.new("Example", doc, {
 *   signature: "export { Example }",
 *   position: Position.new(1, 1),
 *   isNamespaceExport: false
 * })
 * void model
 * ```
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
   * @param options - Printable signature, source position, and namespace export flag.
   * @returns Export model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: ExportNewOptions): Export;
    (doc: Doc, options: ExportNewOptions): (name: string) => Export;
  } = dual(3, (name: string, doc: Doc, options: ExportNewOptions): Export => {
    return new Export({
      name,
      doc,
      signature: options.signature,
      position: options.position,
      isNamespaceExport: options.isNamespaceExport,
    });
  });
}

/**
 * Represents a documented namespace and its nested exported members.
 *
 * @example
 * ```ts
 * import { Doc, Namespace, Position } from "@beep/docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["model"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Namespace.new("Example", doc, {
 *   position: Position.new(1, 1),
 *   interfaces: [],
 *   typeAliases: [],
 *   namespaces: []
 * })
 * void model
 * ```
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
   * @param options - Source position and nested namespace member collections.
   * @returns Namespace model instance.
   */
  static readonly new: {
    (name: string, doc: Doc, options: NamespaceNewOptions): Namespace;
    (doc: Doc, options: NamespaceNewOptions): (name: string) => Namespace;
  } = dual(3, (name: string, doc: Doc, options: NamespaceNewOptions): Namespace => {
    return new Namespace({
      name,
      doc,
      position: options.position,
      interfaces: A.fromIterable(options.interfaces),
      typeAliases: A.fromIterable(options.typeAliases),
      namespaces: A.fromIterable(options.namespaces),
    });
  });
}

/**
 * Represents a fully parsed module ready for validation and printing.
 *
 * @example
 * ```ts
 * import { Module } from "@beep/docgen/Domain"
 * void Module
 * ```
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
   * @param options - Parsed documentation, path segments, and documented module members.
   * @returns Module model instance.
   */
  static readonly new: {
    (source: Parser.SourceShape, name: string, options: ModuleNewOptions): Module;
    (name: string, options: ModuleNewOptions): (source: Parser.SourceShape) => Module;
  } = dual(3, (source: Parser.SourceShape, name: string, options: ModuleNewOptions): Module => {
    return new Module({
      source,
      name,
      doc: options.doc,
      path: A.fromIterable(options.path),
      classes: A.fromIterable(options.classes),
      interfaces: A.fromIterable(options.interfaces),
      functions: A.fromIterable(options.functions),
      typeAliases: A.fromIterable(options.typeAliases),
      constants: A.fromIterable(options.constants),
      exports: A.fromIterable(options.exports),
      namespaces: A.fromIterable(options.namespaces),
    });
  });
}

/**
 * A comparator function for sorting `Module` objects by their file path,
 * represented as a lowercase string.
 *
 * @example
 * ```ts
 * import { ByPath } from "@beep/docgen/Domain"
 * void ByPath
 * ```
 * @category sorting
 * @since 0.0.0
 */
export const ByPath: Order.Order<Module> = Order.mapInput(Str.Order, (module: Module) =>
  pipe(module.path, A.join("/"), Str.toLowerCase)
);

/**
 * Represents a file which can be optionally overwritable.
 *
 * @example
 * ```ts
 * import { File } from "@beep/docgen/Domain"
 * const file = File.new("docs/index.md", "# Docs", { isOverwritable: true })
 * void file
 * ```
 * @category model
 * @since 0.0.0
 */
type FileNewOptions = {
  readonly isOverwritable?: boolean;
};

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
   * @param options - Output file write options.
   * @returns File descriptor instance.
   */
  static readonly new: {
    (path: string, content: string, options: FileNewOptions): File;
    (content: string, options: FileNewOptions): (path: string) => File;
  } = dual(3, (path: string, content: string, options: FileNewOptions): File => {
    const isOverwritable = options.isOverwritable ?? false;
    return new File({ path, content, isOverwritable });
  });
}

/**
 * Unique symbol used to brand docgen-specific errors.
 *
 * @example
 * ```ts
 * import { DocgenErrorTypeId } from "@beep/docgen/Domain"
 * void DocgenErrorTypeId
 * ```
 * @category symbol
 * @since 0.0.0
 */
export const DocgenErrorTypeId = Symbol.for("@beep/docgen/DocgenError");

/**
 * Type-level alias for the unique docgen error branding symbol.
 *
 * @example
 * ```ts
 * import type { DocgenErrorTypeId } from "@beep/docgen/Domain"
 * type ExampleDocgenErrorTypeId = DocgenErrorTypeId
 * ```
 * @category symbol
 * @since 0.0.0
 */
export type DocgenErrorTypeId = typeof DocgenErrorTypeId;

/**
 * Typed error used throughout docgen parsing and generation operations.
 *
 * @example
 * ```ts
 * import { DocgenError } from "@beep/docgen/Domain"
 * const error = new DocgenError({ message: "Unable to generate docs." })
 * void error
 * ```
 * @category model
 * @since 0.0.0
 */
export class DocgenError extends TaggedErrorClass<DocgenError>($I`DocgenError`)("DocgenError", { message: S.String }) {}

/**
 * Represents a handle to the currently executing process.
 *
 * @example
 * ```ts
 * import { Process } from "@beep/docgen/Domain"
 * void Process
 * ```
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
 * @example
 * ```ts
 * import { Process } from "@beep/docgen/Domain"
 * void Process
 * ```
 * @category service
 * @since 0.0.0
 */
export class Process extends Context.Service<Process, ProcessShape>()($I`Process`, {
  make: Effect.succeed(defaultProcess),
}) {
  static readonly layer = Layer.succeed(Process, Process.of(defaultProcess));
}
