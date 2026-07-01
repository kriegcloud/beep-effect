/**
 * Domain models shared by docgen parsing, checking, and printing.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoDocgenId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Context, Effect, Layer, Order, pipe } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import type * as Parser from "./Parser.js";

const $I = $RepoDocgenId.create("Domain");

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
 * import { Position } from "@beep/repo-docgen/Domain"
 * const position = Position.new(1, 1)
 * console.log(position)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Position extends S.Class<Position>($I`Position`)({
  column: S.Finite,
  line: S.Finite,
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
  } = dual(
    2,
    (line: number, column: number): Position =>
      Position.make({
        column,
        line,
      })
  );
}

/**
 * Represents normalized JSDoc metadata for a documented symbol.
 *
 * @example
 * ```ts
 * import { Doc } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * console.log(doc)
 * ```
 * @category models
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
  } = dual(
    2,
    (description: string | undefined, options: DocNewOptions): Doc =>
      Doc.make({
        description,
        since: A.fromIterable(options.since),
        deprecated: A.fromIterable(options.deprecated),
        examples: A.fromIterable(options.examples),
        category: A.fromIterable(options.category),
        throws: A.fromIterable(options.throws),
        sees: A.fromIterable(options.sees),
        tags: options.tags,
      })
  );

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
 * import { Doc, DocEntry, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const entry = DocEntry.new("Example", doc, {
 *   signature: "declare const Example: string",
 *   position: Position.new(1, 1)
 * })
 * console.log(entry)
 * ```
 * @category models
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
  } = dual(
    3,
    (name: string, doc: Doc, options: SignaturePositionOptions): DocEntry =>
      DocEntry.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
      })
  );
}

/**
 * Represents a documented class and its emitted member structure.
 *
 * @example
 * ```ts
 * import { Class, Doc, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
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
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Class extends S.TaggedClass<Class>($I`Class`)("Class", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: ClassNewOptions): Class =>
      Class.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
        methods: A.fromIterable(options.methods),
        staticMethods: A.fromIterable(options.staticMethods),
        properties: A.fromIterable(options.properties),
      })
  );
}

/**
 * Represents a documented interface declaration.
 *
 * @example
 * ```ts
 * import { Doc, Interface, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Interface.new("Example", doc, {
 *   signature: "interface Example {}",
 *   position: Position.new(1, 1)
 * })
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Interface extends S.TaggedClass<Interface>($I`Interface`)("Interface", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: SignaturePositionOptions): Interface =>
      Interface.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
      })
  );
}

/**
 * Represents a documented function declaration or function-valued export.
 *
 * @example
 * ```ts
 * import { Doc, Function, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Function.new("example", doc, {
 *   signature: "declare const example: () => void",
 *   position: Position.new(1, 1)
 * })
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Function extends S.TaggedClass<Function>($I`Function`)("Function", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: SignaturePositionOptions): Function =>
      Function.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
      })
  );
}

/**
 * Represents a documented type alias declaration.
 *
 * @example
 * ```ts
 * import { Doc, Position, TypeAlias } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = TypeAlias.new("Example", doc, {
 *   signature: "type Example = string",
 *   position: Position.new(1, 1)
 * })
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class TypeAlias extends S.TaggedClass<TypeAlias>($I`TypeAlias`)("TypeAlias", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: SignaturePositionOptions): TypeAlias =>
      TypeAlias.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
      })
  );
}

/**
 * Represents a documented exported constant declaration.
 *
 * @example
 * ```ts
 * import { Constant, Doc, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Constant.new("example", doc, {
 *   signature: "declare const example: string",
 *   position: Position.new(1, 1)
 * })
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Constant extends S.TaggedClass<Constant>($I`Constant`)("Constant", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: SignaturePositionOptions): Constant =>
      Constant.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
      })
  );
}

/**
 * Represents a named export declaration that is documented separately from its original declaration.
 *
 * @remarks
 * Namespace export declarations are marked with `isNamespaceExport` so the printer can label
 * `export * as Name from "./module.js"` differently from named export lists.
 *
 * @example
 * ```ts
 * import { Doc, Export, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const model = Export.new("Example", doc, {
 *   signature: "export { Example }",
 *   position: Position.new(1, 1),
 *   isNamespaceExport: false
 * })
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Export extends S.TaggedClass<Export>($I`Export`)("Export", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: ExportNewOptions): Export =>
      Export.make({
        name,
        doc,
        signature: options.signature,
        position: options.position,
        isNamespaceExport: options.isNamespaceExport,
      })
  );
}

/**
 * Represents a documented namespace and its nested exported members.
 *
 * @example
 * ```ts
 * import { Doc, Namespace, Position } from "@beep/repo-docgen/Domain"
 * const doc = Doc.new("Description.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
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
 * console.log(model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Namespace extends S.TaggedClass<Namespace>($I`Namespace`)("Namespace", {
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
  } = dual(
    3,
    (name: string, doc: Doc, options: NamespaceNewOptions): Namespace =>
      Namespace.make({
        name,
        doc,
        position: options.position,
        interfaces: A.fromIterable(options.interfaces),
        typeAliases: A.fromIterable(options.typeAliases),
        namespaces: A.fromIterable(options.namespaces),
      })
  );
}

/**
 * Represents a fully parsed module ready for validation and printing.
 *
 * @example
 * ```ts
 * import { Project } from "ts-morph"
 * import { Doc, Module } from "@beep/repo-docgen/Domain"
 * import { SourceShape } from "@beep/repo-docgen/Parser"
 *
 * const project = new Project({ useInMemoryFileSystem: true })
 * const sourceFile = project.createSourceFile("src/example.ts", "export const value = 1")
 * const source = SourceShape.new(["src", "example.ts"], sourceFile)
 * const doc = Doc.new("Example module.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const module = Module.new(source, "example.ts", {
 *   doc,
 *   path: ["src", "example.ts"],
 *   classes: [],
 *   interfaces: [],
 *   functions: [],
 *   typeAliases: [],
 *   constants: [],
 *   exports: [],
 *   namespaces: []
 * })
 *
 * console.log(module.path)
 * ```
 * @category models
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
  } = dual(
    3,
    (source: Parser.SourceShape, name: string, options: ModuleNewOptions): Module =>
      Module.make({
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
      })
  );
}

type FileNewOptions = {
  readonly isOverwritable?: boolean;
};

/**
 * Ordering that sorts modules by their normalized lowercase source path.
 *
 * @example
 * ```ts
 * import * as A from "effect/Array"
 * import { Project } from "ts-morph"
 * import { ByPath, Doc, Module } from "@beep/repo-docgen/Domain"
 * import { SourceShape } from "@beep/repo-docgen/Parser"
 *
 * const project = new Project({ useInMemoryFileSystem: true })
 * const sourceFile = project.createSourceFile("src/a.ts", "")
 * const doc = Doc.new("Example module.", {
 *   since: ["0.0.0"],
 *   deprecated: [],
 *   examples: [],
 *   category: ["models"],
 *   throws: [],
 *   sees: [],
 *   tags: {}
 * })
 * const first = Module.new(SourceShape.new(["src", "a.ts"], sourceFile), "a.ts", {
 *   doc,
 *   path: ["src", "a.ts"],
 *   classes: [],
 *   interfaces: [],
 *   functions: [],
 *   typeAliases: [],
 *   constants: [],
 *   exports: [],
 *   namespaces: []
 * })
 * const second = Module.new(SourceShape.new(["src", "b.ts"], sourceFile), "b.ts", {
 *   doc,
 *   path: ["src", "b.ts"],
 *   classes: [],
 *   interfaces: [],
 *   functions: [],
 *   typeAliases: [],
 *   constants: [],
 *   exports: [],
 *   namespaces: []
 * })
 *
 * const sorted = A.sort(ByPath)([second, first])
 * console.log(sorted[0]?.name)
 * ```
 * @category utilities
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
 * import { File } from "@beep/repo-docgen/Domain"
 * const file = File.new("docs/index.md", "# Docs", { isOverwritable: true })
 * console.log(file)
 * ```
 * @category models
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
   * @param options - Output file write options.
   * @returns File descriptor instance.
   */
  static readonly new: {
    (path: string, content: string, options: FileNewOptions): File;
    (content: string, options: FileNewOptions): (path: string) => File;
  } = dual(3, (path: string, content: string, options: FileNewOptions): File => {
    const isOverwritable = options.isOverwritable ?? false;
    return File.make({
      path,
      content,
      isOverwritable,
    });
  });
}

/**
 * Unique symbol used to brand docgen-specific errors.
 *
 * @example
 * ```ts
 * import { DocgenErrorTypeId } from "@beep/repo-docgen/Domain"
 *
 * console.log(Symbol.keyFor(DocgenErrorTypeId))
 * ```
 * @category symbols
 * @since 0.0.0
 */
export const DocgenErrorTypeId = Symbol.for("@beep/repo-docgen/DocgenError");

/**
 * Type-level alias for the unique docgen error branding symbol.
 *
 * @example
 * ```ts
 * import type { DocgenErrorTypeId } from "@beep/repo-docgen/Domain"
 * type ExampleDocgenErrorTypeId = DocgenErrorTypeId
 * ```
 * @category symbols
 * @since 0.0.0
 */
export type DocgenErrorTypeId = typeof DocgenErrorTypeId;

/**
 * Typed error used throughout docgen parsing and generation operations.
 *
 * @example
 * ```ts
 * import { DocgenError } from "@beep/repo-docgen/Domain"
 * const error = DocgenError.make({ message: "Unable to generate docs." })
 * console.log(error)
 * ```
 * @category models
 * @since 0.0.0
 */
export class DocgenError extends TaggedErrorClass<DocgenError>($I`DocgenError`)("DocgenError", { message: S.String }) {}

/**
 * Service shape for the process APIs used by docgen.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * const fakeProcess = {
 *   argv: Effect.succeed(["bun", "docgen"]),
 *   cwd: Effect.succeed("/workspace/packages/tooling/tool/docgen"),
 *   platform: Effect.succeed("linux")
 * }
 *
 * console.log(fakeProcess.platform)
 * ```
 * @category services
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
 * Service exposing the current process working directory, platform, and argument vector.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Process } from "@beep/repo-docgen/Domain"
 *
 * const cwd = Effect.runSync(
 *   Effect.gen(function* () {
 *     const process = yield* Process
 *     return yield* process.cwd
 *   }).pipe(Effect.provide(Process.layer))
 * )
 *
 * console.log(cwd.length > 0)
 * ```
 * @category services
 * @since 0.0.0
 */
export class Process extends Context.Service<Process, ProcessShape>()($I`Process`, {
  make: Effect.succeed(defaultProcess),
}) {
  static readonly layer = Layer.succeed(Process, Process.of(defaultProcess));
}
