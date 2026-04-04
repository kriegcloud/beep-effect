/**
 * @since 0.0.0
 */

import { $DocgenId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, Layer, Order, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as Parser from "./Parser.js";

const $I = $DocgenId.create("Domain");

const StringArray = S.Array(S.String);
const OptionalString = S.UndefinedOr(S.String);
const OptionalStringArray = S.UndefinedOr(StringArray);

/**
 * @category model
 * @since 0.0.0
 */
export class Position extends S.Class<Position>($I`Position`)({
  column: S.Number,
  line: S.Number,
}) {
  static new(line: number, column: number): Position {
    return new Position({ column, line });
  }
}

/**
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
 * @category model
 * @since 0.0.0
 */
export class DocEntry extends S.Class<DocEntry>($I`DocEntry`)({
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  static new(name: string, doc: Doc, signature: string, position: Position): DocEntry {
    return new DocEntry({ name, doc, signature, position });
  }
}

/**
 * @category model
 * @since 0.0.0
 */
export class Class extends S.Class<Class>($I`Class`)({
  _tag: S.Literal("Class"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
  methods: S.Array(DocEntry),
  staticMethods: S.Array(DocEntry),
  properties: S.Array(DocEntry),
}) {
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
      _tag: "Class",
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
 * @category model
 * @since 0.0.0
 */
export class Interface extends S.Class<Interface>($I`Interface`)({
  _tag: S.Literal("Interface"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  static new(name: string, doc: Doc, signature: string, position: Position): Interface {
    return new Interface({ _tag: "Interface", name, doc, signature, position });
  }
}

/**
 * @category model
 * @since 0.0.0
 */
export class Function extends S.Class<Function>($I`Function`)({
  _tag: S.Literal("Function"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  static new(name: string, doc: Doc, signature: string, position: Position): Function {
    return new Function({ _tag: "Function", name, doc, signature, position });
  }
}

/**
 * @category model
 * @since 0.0.0
 */
export class TypeAlias extends S.Class<TypeAlias>($I`TypeAlias`)({
  _tag: S.Literal("TypeAlias"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  static new(name: string, doc: Doc, signature: string, position: Position): TypeAlias {
    return new TypeAlias({ _tag: "TypeAlias", name, doc, signature, position });
  }
}

/**
 * @category model
 * @since 0.0.0
 */
export class Constant extends S.Class<Constant>($I`Constant`)({
  _tag: S.Literal("Constant"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
}) {
  static new(name: string, doc: Doc, signature: string, position: Position): Constant {
    return new Constant({ _tag: "Constant", name, doc, signature, position });
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
 * @since 0.0.0
 */
export class Export extends S.Class<Export>($I`Export`)({
  _tag: S.Literal("Export"),
  name: S.String,
  doc: Doc,
  signature: S.String,
  position: Position,
  isNamespaceExport: S.Boolean,
}) {
  static new(name: string, doc: Doc, signature: string, position: Position, isNamespaceExport: boolean): Export {
    return new Export({ _tag: "Export", name, doc, signature, position, isNamespaceExport });
  }
}

/**
 * @category model
 * @since 0.0.0
 */
export class Namespace extends S.Class<Namespace>($I`Namespace`)({
  _tag: S.Literal("Namespace"),
  name: S.String,
  doc: Doc,
  position: Position,
  interfaces: S.Array(Interface),
  typeAliases: S.Array(TypeAlias),
  namespaces: S.Array(S.Any),
}) {
  declare readonly namespaces: ReadonlyArray<Namespace>;

  static new(
    name: string,
    doc: Doc,
    position: Position,
    interfaces: ReadonlyArray<Interface>,
    typeAliases: ReadonlyArray<TypeAlias>,
    namespaces: ReadonlyArray<Namespace>
  ): Namespace {
    return new Namespace({
      _tag: "Namespace",
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
  static new(path: string, content: string, isOverwritable = false): File {
    return new File({ path, content, isOverwritable });
  }
}

/**
 * @category symbol
 * @since 0.0.0
 */
export const DocgenErrorTypeId = Symbol.for("@beep/docgen/DocgenError");

/**
 * @category symbol
 * @since 0.0.0
 */
export type DocgenErrorTypeId = typeof DocgenErrorTypeId;

/**
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
export class Process extends ServiceMap.Service<Process, ProcessShape>()($I`Process`, {
  make: Effect.succeed(defaultProcess),
}) {
  static readonly layer = Layer.succeed(Process, Process.of(defaultProcess));
}
