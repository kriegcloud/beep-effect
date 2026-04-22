/**
 * TypeScript source parser for docgen module models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DocgenId } from "@beep/identity/packages";
import { thunkEmptyStr } from "@beep/utils";
import * as doctrine from "doctrine";
import { Context, Effect, Layer, Path, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as ast from "ts-morph";
import * as Configuration from "./Configuration.js";
import * as Domain from "./Domain.js";

const $I = $DocgenId.create("Parser");

const withSource = <A, E, R>(source: SourceShape, effect: Effect.Effect<A, E, R | Source>) =>
  Effect.scoped(
    Layer.build(Source.layer(source)).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context))))
  );

/**
 * Source metadata carried through parser effects while a module is being processed.
 *
 * @internal
 * @example
 * ```ts
 * import { SourceShape } from "@beep/docgen/Parser"
 * void SourceShape
 * ```
 * @category parsers
 * @since 0.0.0
 */
export class SourceShape {
  readonly path: ReadonlyArray<string>;
  readonly sourceFile: ast.SourceFile;

  constructor(path: ReadonlyArray<string>, sourceFile: ast.SourceFile) {
    this.path = path;
    this.sourceFile = sourceFile;
  }

  /**
   * Creates source metadata for a parsed module.
   *
   * @param path - Path segments describing the module.
   * @param sourceFile - Backing ts-morph source file.
   * @returns Source metadata instance.
   */
  static readonly new: {
    (path: ReadonlyArray<string>, sourceFile: ast.SourceFile): SourceShape;
    (sourceFile: ast.SourceFile): (path: ReadonlyArray<string>) => SourceShape;
  } = dual(2, (path: ReadonlyArray<string>, sourceFile: ast.SourceFile): SourceShape =>
    new SourceShape(path, sourceFile)
  );
}

/**
 * Parser service that provides the active source context while traversing a module.
 *
 * @internal
 * @example
 * ```ts
 * import { Source } from "@beep/docgen/Parser"
 * void Source
 * ```
 * @category parsers
 * @since 0.0.0
 */
export class Source extends Context.Service<Source, SourceShape>()($I`Source`) {
  /**
   * Creates a layer that provides the current parser source context.
   *
   * @param source - Source metadata to provide.
   * @returns Layer providing the {@link Source} service.
   */
  static layer(source: SourceShape) {
    return Layer.succeed(Source, Source.of(source));
  }
}

const sortModulesByPath: <A extends Domain.Module>(self: Iterable<A>) => Array<A> = A.sort(Domain.ByPath);

const getJSDocText: (jsdocs: ReadonlyArray<ast.JSDoc>) => string = A.matchRight({
  onEmpty: thunkEmptyStr,
  onNonEmpty: (_, last) => last.getText(),
});

const getDocComment = (ranges: ReadonlyArray<ast.CommentRange>): O.Option<ast.CommentRange> =>
  pipe(
    ranges,
    A.filter((range) => Str.startsWith("/**")(range.getText())),
    A.last
  );

type Comment = {
  readonly description: string | undefined;
  readonly tags: Record<string, ReadonlyArray<string> | undefined>;
};

/**
 * Parses a raw JSDoc block into a normalized description and grouped tag map.
 *
 * @internal
 * @param text - Raw JSDoc text to parse.
 * @returns Parsed comment description and grouped tag values.
 * @example
 * ```ts
 * import { parseComment } from "@beep/docgen/Parser"
 * const comment = parseComment("/** Example. *\/")
 * void comment
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseComment = (text: string): Comment => {
  const annotation: doctrine.Annotation = doctrine.parse(text, {
    unwrap: true,
  });

  const description = pipe(
    O.fromNullishOr(annotation.description),
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.getOrUndefined
  );

  const tags = pipe(
    annotation.tags,
    A.groupBy((tag) => tag.title),
    R.map((values) =>
      A.map(values, (tag) => pipe(O.fromNullishOr(tag.description), O.map(Str.trim), O.getOrElse(thunkEmptyStr)))
    )
  );

  return { description, tags };
};

const isVariableDeclarationList = (
  value: ast.VariableDeclarationList | ast.CatchClause
): value is ast.VariableDeclarationList => value.getKind() === ast.ts.SyntaxKind.VariableDeclarationList;

const parseDoc = (text: string) => {
  const comment = parseComment(text);
  return Domain.Doc.new(
    comment.description,
    comment.tags.since ?? [],
    comment.tags.deprecated ?? [],
    comment.tags.example ?? [],
    comment.tags.category ?? [],
    comment.tags.throws ?? [],
    comment.tags.see ?? [],
    comment.tags
  );
};

const shouldIgnore = (doc: Domain.Doc): boolean => R.has(doc.tags, "internal") || R.has(doc.tags, "ignore");

const parsePosition = (node: ast.Node): Effect.Effect<Domain.Position, never, Source> =>
  Effect.gen(function* () {
    const source = yield* Source;
    const startPos = node.getStart();
    const position = source.sourceFile.getLineAndColumnAtPos(startPos);
    return Domain.Position.new(position.line, position.column);
  });

const parseInterfaceDeclaration = Effect.fn("parseInterfaceDeclaration")(function* (id: ast.InterfaceDeclaration) {
  const doc = parseDoc(getJSDocText(id.getJsDocs()));
  if (shouldIgnore(doc)) {
    return [];
  }

  const position = yield* parsePosition(id);
  return [Domain.Interface.new(id.getName(), doc, id.getText(), position)];
});

const parseInterfaceDeclarations = (interfaces: ReadonlyArray<ast.InterfaceDeclaration>) =>
  Effect.forEach(
    A.filter(interfaces, (declaration) => declaration.isExported()),
    parseInterfaceDeclaration
  ).pipe(Effect.map(A.flatten));

/**
 * Parses exported interface declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseInterfaces } from "@beep/docgen/Parser"
 * void parseInterfaces
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseInterfaces = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseInterfaceDeclarations(source.sourceFile.getInterfaces());
});

const parseType = (node: ast.Node) =>
  node
    .getType()
    .getText(
      node,
      ast.ts.TypeFormatFlags.NoTruncation |
        ast.ts.TypeFormatFlags.WriteArrayAsGenericType |
        ast.ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
        ast.ts.TypeFormatFlags.NoTypeReduction |
        ast.ts.TypeFormatFlags.AllowUniqueESSymbolType |
        ast.ts.TypeFormatFlags.WriteArrowStyleSignature
    );

const getFunctionDeclarationJSDocs = (fd: ast.FunctionDeclaration): Array<ast.JSDoc> =>
  A.matchLeft(fd.getOverloads(), {
    onEmpty: () => fd.getJsDocs(),
    onNonEmpty: (firstOverload) => firstOverload.getJsDocs(),
  });

const parseFunctionDeclaration = Effect.fn("parseFunctionDeclaration")(function* (fd: ast.FunctionDeclaration) {
  const doc = parseDoc(getJSDocText(getFunctionDeclarationJSDocs(fd)));
  if (shouldIgnore(doc)) {
    return [];
  }

  const name = fd.getName() ?? "";
  const signature = `declare const ${name}: ${parseType(fd)}`;
  const position = yield* parsePosition(fd);
  return [Domain.Function.new(name, doc, signature, position)];
});

const parseFunctionVariableDeclaration = Effect.fn("parseFunctionVariableDeclaration")(function* (
  vd: ast.VariableDeclaration
) {
  const statement = vd.getParent().getParent();
  if (!ast.Node.isVariableStatement(statement)) {
    return [];
  }
  const doc = parseDoc(getJSDocText(statement.getJsDocs()));
  if (shouldIgnore(doc)) {
    return [];
  }

  const name = vd.getName();
  const signature = `declare const ${name}: ${parseType(vd)}`;
  const position = yield* parsePosition(vd);
  return [Domain.Function.new(name, doc, signature, position)];
});

const getFunctionDeclarations = Effect.gen(function* () {
  const source = yield* Source;
  const functions = A.filter(source.sourceFile.getFunctions(), (fd) => fd.isExported());
  const arrows = A.filter(source.sourceFile.getVariableDeclarations(), (vd) => {
    if (!isVariableDeclarationList(vd.getParent())) {
      return false;
    }

    const statement = vd.getParent().getParent();
    if (!ast.Node.isVariableStatement(statement)) {
      return false;
    }

    return (
      statement.isExported() &&
      pipe(
        O.fromNullishOr(vd.getInitializer()),
        O.filter((expr) => ast.Node.isFunctionLikeDeclaration(expr)),
        O.isSome
      )
    );
  });

  return { functions, arrows };
});

/**
 * Parses exported function declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseFunctions } from "@beep/docgen/Parser"
 * void parseFunctions
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseFunctions = Effect.gen(function* () {
  const { arrows, functions } = yield* getFunctionDeclarations;
  const functionDeclarations = yield* Effect.forEach(functions, parseFunctionDeclaration).pipe(Effect.map(A.flatten));
  const functionVariableDeclarations = yield* Effect.forEach(arrows, parseFunctionVariableDeclaration).pipe(
    Effect.map(A.flatten)
  );
  return [...functionDeclarations, ...functionVariableDeclarations];
});

const parseTypeAliasDeclaration = Effect.fn("parseTypeAliasDeclaration")(function* (ta: ast.TypeAliasDeclaration) {
  const doc = parseDoc(getJSDocText(ta.getJsDocs()));
  if (shouldIgnore(doc)) {
    return [];
  }

  const name = ta.getName();
  const type = parseType(ta);
  const definition = ta.getTypeNode()?.getText() ?? "";
  const signature = `type ${ta.getTypeParameters().length > 0 ? type : name} = ${definition}`;
  const position = yield* parsePosition(ta);
  return [Domain.TypeAlias.new(name, doc, signature, position)];
});

const parseTypeAliasDeclarations = (typeAliases: ReadonlyArray<ast.TypeAliasDeclaration>) =>
  Effect.forEach(
    A.filter(typeAliases, (declaration) => declaration.isExported()),
    parseTypeAliasDeclaration
  ).pipe(Effect.map(A.flatten));

/**
 * Parses exported type alias declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseTypeAliases } from "@beep/docgen/Parser"
 * void parseTypeAliases
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseTypeAliases = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseTypeAliasDeclarations(source.sourceFile.getTypeAliases());
});

const parseConstantVariableDeclaration = Effect.fn("parseConstantVariableDeclaration")(function* (
  vd: ast.VariableDeclaration
) {
  const statement = vd.getParent().getParent();
  if (!ast.Node.isVariableStatement(statement)) {
    return [];
  }
  const doc = parseDoc(getJSDocText(statement.getJsDocs()));
  if (shouldIgnore(doc)) {
    return [];
  }

  const name = vd.getName();
  const signature = `declare const ${name}: ${parseType(vd)}`;
  const position = yield* parsePosition(vd);
  return [Domain.Constant.new(name, doc, signature, position)];
});

/**
 * Parses exported constant declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseConstants } from "@beep/docgen/Parser"
 * void parseConstants
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseConstants = Effect.gen(function* () {
  const source = yield* Source;
  const declarations = A.filter(source.sourceFile.getVariableDeclarations(), (vd) => {
    if (!isVariableDeclarationList(vd.getParent())) {
      return false;
    }

    const statement = vd.getParent().getParent();
    if (!ast.Node.isVariableStatement(statement)) {
      return false;
    }

    return (
      statement.isExported() &&
      pipe(
        O.fromNullishOr(vd.getInitializer()),
        O.filter((expr) => !ast.Node.isFunctionLikeDeclaration(expr)),
        O.isSome
      )
    );
  });

  return yield* Effect.forEach(declarations, parseConstantVariableDeclaration).pipe(Effect.map(A.flatten));
});

const parseExportSpecifier = Effect.fn("parseExportSpecifier")(function* (
  es: ast.ExportSpecifier,
  declarationDocComment: O.Option<ast.CommentRange>
) {
  const name = es.compilerNode.name.text;
  const specifierDocComment = getDocComment(es.getLeadingCommentRanges());
  const docComment = O.isSome(specifierDocComment) ? specifierDocComment : declarationDocComment;
  const doc = O.isSome(docComment) ? parseDoc(docComment.value.getText()) : parseDoc("");
  const signature = `declare const ${name}: ${parseType(es)}`;
  const position = yield* parsePosition(es);
  return Domain.Export.new(name, doc, signature, position, false);
});

const parseExportStar = Effect.fn("parseExportStar")(function* (ed: ast.ExportDeclaration) {
  const moduleSpecifier = ed.getModuleSpecifier();
  const name = moduleSpecifier?.getText() ?? "";
  const namespace = ed.getNamespaceExport()?.getName();
  const signature = `export *${namespace === undefined ? "" : ` as ${namespace}`} from ${name}`;
  const docComment = getDocComment(ed.getLeadingCommentRanges());
  const doc = O.isSome(docComment) ? parseDoc(docComment.value.getText()) : parseDoc("");
  const position = yield* parsePosition(ed);
  return Domain.Export.new(
    namespace ?? name,
    doc.modifyDescription(
      `Re-exports all named exports from the ${name} module${namespace === undefined ? "" : ` as \`${namespace}\``}.`
    ),
    signature,
    position,
    true
  );
});

const parseNamedExports = (ed: ast.ExportDeclaration) => {
  const namedExports = ed.getNamedExports();
  const declarationDocComment = getDocComment(ed.getLeadingCommentRanges());
  return namedExports.length === 0
    ? parseExportStar(ed).pipe(Effect.map(A.of))
    : Effect.forEach(namedExports, (specifier) => parseExportSpecifier(specifier, declarationDocComment));
};

/**
 * Parses manual export declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseExports } from "@beep/docgen/Parser"
 * void parseExports
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseExports = Effect.gen(function* () {
  const source = yield* Source;
  const exports = yield* Effect.forEach(source.sourceFile.getExportDeclarations(), parseNamedExports);
  return A.flatten(exports);
});

const parseModuleDeclaration = (md: ast.ModuleDeclaration): Effect.Effect<Array<Domain.Namespace>, never, Source> => {
  const doc = parseDoc(getJSDocText(md.getJsDocs()));
  if (shouldIgnore(doc)) {
    return Effect.succeed([]);
  }

  return Effect.gen(function* () {
    const interfaces = yield* parseInterfaceDeclarations(md.getInterfaces());
    const typeAliases = yield* parseTypeAliasDeclarations(md.getTypeAliases());
    const namespaces = yield* parseModuleDeclarations(md.getModules());
    const position = yield* parsePosition(md);
    return [Domain.Namespace.new(md.getName(), doc, position, interfaces, typeAliases, namespaces)];
  });
};

const parseModuleDeclarations = (namespaces: ReadonlyArray<ast.ModuleDeclaration>) =>
  Effect.forEach(
    A.filter(namespaces, (namespace) => namespace.isExported()),
    parseModuleDeclaration
  ).pipe(Effect.map(A.flatten));

/**
 * Parses exported namespace declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseNamespaces } from "@beep/docgen/Parser"
 * void parseNamespaces
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseNamespaces = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseModuleDeclarations(source.sourceFile.getModules());
});

const getTypeParameters = (parameters: ReadonlyArray<ast.TypeParameterDeclaration>): string =>
  parameters.length === 0
    ? ""
    : `<${pipe(
        parameters,
        A.map((parameter) => parameter.getName()),
        A.join(", ")
      )}>`;

const parseMethod = Effect.fn("parseMethod")(function* (md: ast.MethodDeclaration) {
  const name = md.getName();
  const jsdocs = A.matchLeft(md.getOverloads(), {
    onEmpty: () => md.getJsDocs(),
    onNonEmpty: (head) => head.getJsDocs(),
  });
  const doc = parseDoc(getJSDocText(jsdocs));
  if (shouldIgnore(doc)) {
    return O.none();
  }

  const position = yield* parsePosition(md);
  return O.some(Domain.DocEntry.new(name, doc, `declare const ${name}: ${parseType(md)}`, position));
});

const parseProperty = Effect.fn("parseProperty")(function* (pd: ast.PropertyDeclaration) {
  const doc = parseDoc(getJSDocText(pd.getJsDocs()));
  if (shouldIgnore(doc)) {
    return [];
  }

  const readonlyPrefix = pipe(
    O.fromNullishOr(pd.getFirstModifierByKind(ast.ts.SyntaxKind.ReadonlyKeyword)),
    O.match({
      onNone: thunkEmptyStr,
      onSome: () => "readonly ",
    })
  );
  const position = yield* parsePosition(pd);
  return [Domain.DocEntry.new(pd.getName(), doc, `${readonlyPrefix}${pd.getName()}: ${parseType(pd)}`, position)];
});

const parseProperties = (c: ast.ClassDeclaration) =>
  Effect.forEach(
    A.filter(
      c.getProperties(),
      (property) =>
        !property.isStatic() &&
        pipe(property.getFirstModifierByKind(ast.ts.SyntaxKind.PrivateKeyword), O.fromNullishOr, O.isNone)
    ),
    parseProperty
  ).pipe(Effect.map(A.flatten));

/**
 * Computes a printable constructor signature without including the implementation body.
 *
 * @internal
 * @param constructorDeclaration - Constructor declaration to serialize.
 * @returns Constructor signature text suitable for generated docs.
 * @example
 * ```ts
 * import { getConstructorDeclarationSignature } from "@beep/docgen/Parser"
 * void getConstructorDeclarationSignature
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const getConstructorDeclarationSignature = (constructorDeclaration: ast.ConstructorDeclaration): string =>
  pipe(
    O.fromNullishOr(constructorDeclaration.compilerNode.body),
    O.match({
      onNone: () => constructorDeclaration.getText(),
      onSome: (body) => {
        const end = body.getStart() - constructorDeclaration.getStart() - 1;
        return constructorDeclaration.getText().substring(0, end);
      },
    })
  );

const getClassDeclarationSignature = (c: ast.ClassDeclaration) => {
  const name = c.getName() ?? "";
  return pipe(
    Effect.succeed(getTypeParameters(c.getTypeParameters())),
    Effect.map((typeParameters) =>
      pipe(
        c.getConstructors(),
        A.matchLeft({
          onEmpty: () => `declare class ${name}${typeParameters}`,
          onNonEmpty: (head) =>
            `declare class ${name}${typeParameters} { ${getConstructorDeclarationSignature(head)} }`,
        })
      )
    )
  );
};

const parseClass = Effect.fn("parseClass")(function* (c: ast.ClassDeclaration) {
  const doc = parseDoc(getJSDocText(c.getJsDocs()));
  if (shouldIgnore(doc)) {
    return [];
  }

  const name = c.getName() ?? "";
  const signature = yield* getClassDeclarationSignature(c);
  const methods = yield* Effect.forEach(c.getInstanceMethods(), parseMethod).pipe(Effect.map(A.getSomes));
  const staticMethods = yield* Effect.forEach(c.getStaticMethods(), parseMethod).pipe(Effect.map(A.getSomes));
  const properties = yield* parseProperties(c);
  const position = yield* parsePosition(c);
  return [Domain.Class.new(name, doc, signature, position, methods, staticMethods, properties)];
});

/**
 * Parses exported class declarations from the active source file.
 *
 * @example
 * ```ts
 * import { parseClasses } from "@beep/docgen/Parser"
 * void parseClasses
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseClasses = Effect.gen(function* () {
  const source = yield* Source;
  const exportedClasses = A.filter(source.sourceFile.getClasses(), (declaration) => declaration.isExported());
  return yield* Effect.forEach(exportedClasses, parseClass).pipe(Effect.map(A.flatten));
});

/**
 * Parses the file-level module documentation block from the current source file.
 *
 * @internal
 * @example
 * ```ts
 * import { parseModuleDocumentation } from "@beep/docgen/Parser"
 * void parseModuleDocumentation
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseModuleDocumentation = Effect.gen(function* () {
  const source = yield* Source;
  const firstStatement = A.head(source.sourceFile.getStatements());
  if (O.isSome(firstStatement)) {
    const docComment = getDocComment(firstStatement.value.getLeadingCommentRanges());
    if (O.isSome(docComment)) {
      return parseDoc(docComment.value.getText());
    }
  }

  return parseDoc("");
});

/**
 * Parses the active source file into a docgen module model.
 *
 * @example
 * ```ts
 * import { parseModule } from "@beep/docgen/Parser"
 * void parseModule
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseModule = Effect.gen(function* () {
  const source = yield* Source;
  const doc = yield* parseModuleDocumentation;
  const interfaces = yield* parseInterfaces;
  const functions = yield* parseFunctions;
  const typeAliases = yield* parseTypeAliases;
  const classes = yield* parseClasses;
  const constants = yield* parseConstants;
  const exports = yield* parseExports;
  const namespaces = yield* parseNamespaces;
  const name = source.sourceFile.getBaseName();

  return Domain.Module.new(
    source,
    name,
    doc,
    source.path,
    classes,
    interfaces,
    functions,
    typeAliases,
    constants,
    exports,
    namespaces
  );
});

/**
 * Creates a parser for a single file using a shared ts-morph project instance.
 *
 * @internal
 * @param project - Project used to resolve and parse source files.
 * @returns Function that parses one file into a module model.
 * @example
 * ```ts
 * import { parseFile } from "@beep/docgen/Parser"
 * void parseFile
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseFile =
  (project: ast.Project) =>
  (file: Domain.File): Effect.Effect<Domain.Module, Array<string>, Path.Path> =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const sourceFile = project.getSourceFile(file.path);
      const filePath = Str.split(path.sep)(file.path);

      if (sourceFile !== undefined && filePath.length > 0) {
        return yield* withSource(SourceShape.new(filePath, sourceFile), parseModule);
      }

      return yield* Effect.fail([`Unable to locate file: ${file.path}`]);
    });

const createProject = Effect.fn("createProject")(function* (files: ReadonlyArray<Domain.File>) {
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const baseCompilerOptions = {
    strict: true,
    moduleResolution: "node" as const,
  };
  const parsed = ast.ts.parseJsonConfigFileContent(
    {
      compilerOptions: {
        ...baseCompilerOptions,
        ...config.parseCompilerOptions,
      },
    },
    ast.ts.sys,
    cwd
  );

  const project = new ast.Project({
    compilerOptions: parsed.options,
  });

  for (const file of files) {
    project.addSourceFileAtPath(file.path);
  }

  return project;
});

/**
 * Parses a set of source files into sorted module models.
 *
 * @param files - Files to parse into module documentation models.
 * @returns Effect that parses and sorts the provided files into modules.
 * @example
 * ```ts
 * import { parseFiles } from "@beep/docgen/Parser"
 * const parsed = parseFiles([])
 * void parsed
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const parseFiles = (files: ReadonlyArray<Domain.File>) =>
  createProject(files).pipe(
    Effect.flatMap((project) => pipe(files, Effect.validate(parseFile(project)), Effect.map(sortModulesByPath)))
  );
