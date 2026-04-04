/**
 * @module @beep/repo-cli/commands/DocgenV2/Parser
 * @since 0.0.0
 */

import chalk from "@beep/chalk";
import { $RepoCliId } from "@beep/identity/packages";
import { Category as CategorySchema, type Category as CategoryValue } from "@beep/repo-utils/JSDoc/models/index";
import { SemanticVersion } from "@beep/schema";
import { Struct, thunkEmptyStr } from "@beep/utils";
import * as doctrine from "doctrine";
import { Effect, flow, Order, Path, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as ast from "ts-morph";
import * as Configuration from "./Configuration.ts";
import * as Domain from "./Domain.ts";
import type * as File from "./File.ts";
import * as Process from "./Process.ts";

const $I = $RepoCliId.create("commands/DocgenV2/Parser");

const SourceFile = S.declare((u: unknown): u is ast.SourceFile => u instanceof ast.SourceFile);

/**
 * Carries the active source file and its path segments while parser effects run.
 *
 * @internal
 * @category Context
 * @since 0.0.0
 */
export class SourceShape extends S.Class<SourceShape>($I`SourceShape`)({
  path: S.Array(S.String),
  sourceFile: SourceFile,
}) {}

/**
 * Supplies the active source file context to parser effects.
 *
 * @internal
 * @category Services
 * @since 0.0.0
 */
export class Source extends ServiceMap.Service<Source, SourceShape>()($I`Source`) {}

/**
 * Represents the parsed description and tag map extracted from a JSDoc block.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Comment extends S.Class<Comment>($I`Comment`)(
  {
    description: S.Option(S.String),
    tags: S.Record(S.String, S.String.pipe(S.Option, S.NonEmptyArray)),
  },
  $I.annote("Comment", {
    description: "Represents the parsed description and tag map extracted from a JSDoc block.",
  })
) {}

const sortByName: <
  const T extends {
    readonly name: string;
  },
>(
  self: Iterable<T>
) => Array<T> = A.sort(
  pipe(
    Str.Order,
    Order.mapInput(({ name }: { readonly name: string }) => name)
  )
);

const sortModulesByPath: <const T extends Domain.Module>(self: Iterable<T>) => Array<T> = A.sort(Domain.ByPath);

/**
 * Removes `import("...").` prefixes from rendered type text.
 *
 * @internal
 * @returns A helper that strips inline import type syntax from declaration text.
 * @category Utilities
 * @since 0.0.0
 */
export const stripImportTypes = flow(Str.replace(/import\("((?!").)*"\)./g, ""));

const getJSDocText: (jsdocs: ReadonlyArray<ast.JSDoc>) => string = A.matchRight({
  onEmpty: thunkEmptyStr,
  onNonEmpty: (_, last) => last.getText(),
});

const hasTag: {
  (comment: Comment, tag: string): boolean;
  (tag: string): (comment: Comment) => boolean;
} = dual(2, (comment: Comment, tag: string) => pipe(comment.tags, R.get(tag), O.isSome));

const hasInternalTag = hasTag("internal");

const hasIgnoreTag = hasTag("ignore");

const getVariableStatement = (vd: ast.VariableDeclaration): O.Option<ast.VariableStatement> =>
  pipe(
    O.fromNullishOr(vd.getParent()),
    O.filter(ast.Node.isVariableDeclarationList),
    O.flatMap((declarationList) => O.fromNullishOr(declarationList.getParent())),
    O.filter(ast.Node.isVariableStatement)
  );

/**
 * Parses raw JSDoc text into normalized description and tag collections.
 *
 * @internal
 * @param text The raw JSDoc text to parse.
 * @returns A normalized `Comment` model.
 * @category Parsers
 * @since 0.0.0
 */
export const parseComment = (text: string): Comment => {
  const annotation: doctrine.Annotation = doctrine.parse(text, {
    unwrap: true,
  });
  const tags = pipe(
    annotation.tags,
    A.groupBy((tag) => tag.title),
    R.map(A.map((tag) => pipe(O.fromNullishOr(tag.description), O.filter(Str.isNonEmpty))))
  );
  const description = pipe(O.fromNullishOr(annotation.description), O.filter(Str.isNonEmpty));
  return new Comment({
    description,
    tags,
  });
};

const getMissingTagError = (tag: string, path: ReadonlyArray<string>, name: string): string =>
  `Missing ${chalk.bold(tag)} tag in ${chalk.bold(`${path.join("/")}#${name}`)} documentation`;

const getSinceTag = Effect.fn(function* (name: string, comment: Comment) {
  const config = yield* Configuration.Configuration;
  const source = yield* Source;
  const since = R.get(comment.tags, "since").pipe(O.flatMap(A.headNonEmpty), O.map(Str.trim), O.filter(Str.isNonEmpty));
  if (O.isNone(since) && (config.enforceVersion || R.has(comment.tags, "since"))) {
    return yield* Effect.fail(getMissingTagError("@since", source.path, name));
  }
  return since;
});

const getCategoryTag = Effect.fn(function* (name: string, comment: Comment) {
  const source = yield* Source;
  const category = R.get(comment.tags, "category").pipe(
    O.flatMap(A.headNonEmpty),
    O.map(Str.trim),
    O.filter(Str.isNonEmpty)
  );
  if (O.isNone(category) && R.has(comment.tags, "category")) {
    return yield* Effect.fail(getMissingTagError("@category", source.path, name));
  }
  return category;
});

const getDescription = Effect.fn(function* (name: string, comment: Comment) {
  const config = yield* Configuration.Configuration;
  const source = yield* Source;
  if (O.isNone(comment.description) && P.isNotNullish(config.enforceDescriptions)) {
    return yield* Effect.fail(
      `Missing ${chalk.bold("description")} in ${chalk.bold(`${source.path.join("/")}#${name}`)} documentation`
    );
  }
  return comment.description;
});

const fencedExampleRegex = /^(?<fenceStart>(```|~~~)[^\n]*)\n(?<body>[\S\s]*)(?<fenceEnd>\n(```|~~~))$/;

const parseExample = (body: string): Domain.Example => {
  const example = fencedExampleRegex.exec(body);

  if (example === null) {
    return new Domain.Example({
      body,
      fences: O.none(),
    });
  }

  return new Domain.Example({
    body: example?.groups?.body ?? "",
    fences: O.some(
      new Domain.ExampleFence({
        start: example?.groups?.fenceStart?.trim() ?? "```ts",
        end: example?.groups?.fenceEnd?.trim() ?? "```",
      })
    ),
  });
};

const emptyExamples = (): ReadonlyArray<Domain.Example> => [];
const decodeCategoryTag = S.decodeUnknownOption(CategorySchema);
const decodeSemanticVersion = SemanticVersion.decodeUnknownOption;
const decodeOptionalCategory = (value: O.Option<string>): O.Option<CategoryValue> =>
  pipe(value, O.flatMap(decodeCategoryTag));
const decodeOptionalSemanticVersion = (value: O.Option<string>): O.Option<SemanticVersion> =>
  pipe(value, O.flatMap(decodeSemanticVersion));

const getExamplesTag = Effect.fn(function* (name: string, comment: Comment, isModule: boolean) {
  const config = yield* Configuration.Configuration;
  const source = yield* Source;
  const examples = R.get(comment.tags, "example").pipe(
    O.map(flow(A.getSomes, A.map(parseExample))),
    O.getOrElse(emptyExamples)
  );
  if (A.isReadonlyArrayEmpty(examples) && P.isNotNullish(config.enforceExamples) && !isModule) {
    return yield* Effect.fail(getMissingTagError("@example", source.path, name));
  }
  return examples;
});

/**
 * Builds validated documentation metadata from raw JSDoc text.
 *
 * @internal
 * @param name The symbol name used in validation errors.
 * @param text The raw JSDoc text to parse.
 * @param isModule Whether module-level example enforcement should be skipped.
 * @returns An effect that yields the parsed `Doc` metadata.
 * @category Parsers
 * @since 0.0.0
 */
export const getDoc = Effect.fn(function* (name: string, text: string, isModule = false) {
  const comment = parseComment(text);
  const since = yield* getSinceTag(name, comment);
  const category = yield* getCategoryTag(name, comment);
  const description = yield* getDescription(name, comment);
  const examples = yield* getExamplesTag(name, comment, isModule);
  const deprecated = O.isSome(R.get(comment.tags, "deprecated"));
  return Domain.createDoc(
    description,
    decodeOptionalSemanticVersion(since),
    deprecated,
    examples,
    decodeOptionalCategory(category)
  );
});

const parseInterfaceDeclaration = Effect.fn(function* (id: ast.InterfaceDeclaration) {
  const name = id.getName();
  const text = getJSDocText(id.getJsDocs());
  const doc = yield* getDoc(name, text);
  const signature = id.getText();
  return Domain.createInterface(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    signature
  );
});

const shouldNotIgnore = (jsdocs: ReadonlyArray<ast.JSDoc>): boolean => {
  const comment = parseComment(getJSDocText(jsdocs));
  return !hasInternalTag(comment) && !hasIgnoreTag(comment);
};

const parseInterfaceDeclarations = (interfaces: ReadonlyArray<ast.InterfaceDeclaration>) => {
  const exportedInterfaces = A.filter(interfaces, (id) => id.isExported() && shouldNotIgnore(id.getJsDocs()));
  return Effect.validate(exportedInterfaces, parseInterfaceDeclaration).pipe(Effect.map(sortByName));
};

/**
 * Parses exported interfaces from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseInterfaces = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseInterfaceDeclarations(source.sourceFile.getInterfaces());
});

const getFunctionDeclarationSignature = (f: ast.FunctionDeclaration): string => {
  const text = f.getText();
  return pipe(
    O.fromNullishOr(f.compilerNode.body),
    O.match({
      onNone: () => Str.replace("export function ", "export declare function" + " ")(text),
      onSome: (body) => {
        const end = body.getStart() - f.getStart() - 1;
        return text.substring(0, end).replace("export function ", "export declare function ");
      },
    })
  );
};

const getFunctionDeclarationJSDocs = (fd: ast.FunctionDeclaration): Array<ast.JSDoc> =>
  pipe(
    fd.getOverloads(),
    A.matchLeft({
      onEmpty: () => fd.getJsDocs(),
      onNonEmpty: (firstOverload) => firstOverload.getJsDocs(),
    })
  );

const parseFunctionDeclaration = Effect.fn(function* (fd: ast.FunctionDeclaration) {
  const source = yield* Source;
  const name = yield* Effect.fromOption(O.fromNullishOr(fd.getName())).pipe(
    Effect.mapError(() => `Missing ${chalk.bold("function name")} in module ${chalk.bold(source.path.join("/"))}`)
  );
  const text = getJSDocText(getFunctionDeclarationJSDocs(fd));
  const doc = yield* getDoc(name, text);
  const signatures = pipe(
    fd.getOverloads(),
    A.matchRight({
      onEmpty: () => [getFunctionDeclarationSignature(fd)],
      onNonEmpty: (init, last) =>
        pipe(init.map(getFunctionDeclarationSignature), A.append(getFunctionDeclarationSignature(last))),
    })
  );
  return Domain.createFunction(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    signatures
  );
});

const parseFunctionVariableDeclaration = Effect.fn(function* (vd: ast.VariableDeclaration) {
  const variableStatement = yield* Effect.fromOption(getVariableStatement(vd)).pipe(Effect.orDie);
  const name = vd.getName();
  const text = getJSDocText(variableStatement.getJsDocs());
  const doc = yield* getDoc(name, text);
  const signature = `export declare const ${name}: ${stripImportTypes(vd.getType().getText(vd))}`;
  return Domain.createFunction(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    [signature]
  );
});

const isDocumentedExportedVariableStatement = (vd: ast.VariableDeclaration): boolean =>
  pipe(
    getVariableStatement(vd),
    O.filter((statement) => statement.isExported() && shouldNotIgnore(statement.getJsDocs())),
    O.isSome
  );

const hasFunctionLikeInitializer = (vd: ast.VariableDeclaration): boolean =>
  pipe(O.fromNullishOr(vd.getInitializer()), O.filter(ast.Node.isFunctionLikeDeclaration), O.isSome);

const hasNonFunctionLikeInitializer = (vd: ast.VariableDeclaration): boolean =>
  pipe(
    O.fromNullishOr(vd.getInitializer()),
    O.filter((initializer) => !ast.Node.isFunctionLikeDeclaration(initializer)),
    O.isSome
  );

const getFunctionDeclarations = Effect.gen(function* () {
  const source = yield* Source;
  const functions = A.filter(
    source.sourceFile.getFunctions(),
    (fd) => fd.isExported() && shouldNotIgnore(getFunctionDeclarationJSDocs(fd))
  );
  const arrows = A.filter(
    source.sourceFile.getVariableDeclarations(),
    (vd) => isDocumentedExportedVariableStatement(vd) && hasFunctionLikeInitializer(vd)
  );
  return {
    arrows,
    functions,
  };
});

const parseFunctionDeclarations = (functions: ReadonlyArray<ast.FunctionDeclaration>) =>
  Effect.validate(functions, parseFunctionDeclaration).pipe(Effect.map(sortByName));

/**
 * Parses exported functions and function-like variable declarations from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseFunctions = Effect.gen(function* () {
  const { arrows, functions } = yield* getFunctionDeclarations;
  const functionDeclarations = yield* parseFunctionDeclarations(functions);
  const functionVariableDeclarations = yield* Effect.validate(arrows, parseFunctionVariableDeclaration);
  return pipe([...functionDeclarations, ...functionVariableDeclarations], sortByName);
});

const parseTypeAliasDeclaration = Effect.fn(function* (typeAlias: ast.TypeAliasDeclaration) {
  const name = typeAlias.getName();
  const text = getJSDocText(typeAlias.getJsDocs());
  const doc = yield* getDoc(name, text);
  return Domain.createTypeAlias(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    typeAlias.getText()
  );
});

const parseTypeAliasDeclarations = (typeAliases: ReadonlyArray<ast.TypeAliasDeclaration>) => {
  const exportedTypeAliases = A.filter(
    typeAliases,
    (typeAlias) => typeAlias.isExported() && shouldNotIgnore(typeAlias.getJsDocs())
  );
  return Effect.validate(exportedTypeAliases, parseTypeAliasDeclaration).pipe(Effect.map(sortByName));
};

/**
 * Parses exported type aliases from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseTypeAliases = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseTypeAliasDeclarations(source.sourceFile.getTypeAliases());
});

const parseConstantVariableDeclaration = Effect.fn(function* (vd: ast.VariableDeclaration) {
  const variableStatement = yield* Effect.fromOption(getVariableStatement(vd)).pipe(Effect.orDie);
  const name = vd.getName();
  const text = getJSDocText(variableStatement.getJsDocs());
  const doc = yield* getDoc(name, text);
  const type = stripImportTypes(vd.getType().getText(vd));
  return Domain.createConstant(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    `export declare const ${name}: ${type}`
  );
});

/**
 * Parses exported constant declarations from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseConstants = Effect.gen(function* () {
  const source = yield* Source;
  const variableDeclarations = A.filter(
    source.sourceFile.getVariableDeclarations(),
    (vd) => isDocumentedExportedVariableStatement(vd) && hasNonFunctionLikeInitializer(vd)
  );
  return yield* Effect.validate(variableDeclarations, parseConstantVariableDeclaration);
});

const parseExportSpecifier = Effect.fn(function* (specifier: ast.ExportSpecifier) {
  const source = yield* Source;
  const name = specifier.getName();
  const type = stripImportTypes(specifier.getType().getText(specifier));
  const maybeCommentRange = A.head(specifier.getLeadingCommentRanges());
  if (O.isNone(maybeCommentRange)) {
    return yield* Effect.fail(`Missing ${chalk.bold(name)} documentation in ${chalk.bold(source.path.join("/"))}`);
  }
  const doc = yield* getDoc(name, maybeCommentRange.value.getText());
  return Domain.createExport(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    `export declare const ${name}: ${type}`
  );
});

const parseExportStar = Effect.fn(function* (exportDeclaration: ast.ExportDeclaration) {
  const source = yield* Source;
  const moduleSpecifier = yield* Effect.fromOption(O.fromNullishOr(exportDeclaration.getModuleSpecifier())).pipe(
    Effect.mapError(
      () => `Missing ${chalk.bold("module specifier")} for re-export in ${chalk.bold(source.path.join("/"))}`
    )
  );
  const name = moduleSpecifier.getText();
  const namespace = pipe(
    exportDeclaration.getNamespaceExport(),
    O.fromNullishOr,
    O.map((value) => value.getName())
  );
  const signature = `export *${O.match(namespace, {
    onNone: thunkEmptyStr,
    onSome: (value) => ` as ${value}`,
  })} from ${name}`;
  const maybeCommentRange = A.head(exportDeclaration.getLeadingCommentRanges());
  if (O.isNone(maybeCommentRange)) {
    return yield* Effect.fail(`Missing ${chalk.bold(signature)} documentation in ${chalk.bold(source.path.join("/"))}`);
  }
  const doc = yield* getDoc(name, maybeCommentRange.value.getText());
  return Domain.createExport(
    Domain.createNamedDoc(
      `From ${name}`,
      pipe(
        doc.description,
        O.orElse(() =>
          O.some(
            `Re-exports all named exports from the ${name} module${O.match(namespace, {
              onNone: () => ".",
              onSome: (value) => ` as \`${value}\`.`,
            })}`
          )
        )
      ),
      doc.since,
      doc.deprecated,
      doc.examples,
      doc.category
    ),
    signature
  );
});

const parseNamedExports = (exportDeclaration: ast.ExportDeclaration) =>
  pipe(
    exportDeclaration.getNamedExports(),
    A.matchLeft({
      onEmpty: () =>
        parseExportStar(exportDeclaration).pipe(
          Effect.mapBoth({
            onFailure: A.of,
            onSuccess: A.of,
          })
        ),
      onNonEmpty: () => Effect.validate(exportDeclaration.getNamedExports(), parseExportSpecifier),
    })
  );

/**
 * Parses documented re-exports from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseExports = Effect.gen(function* () {
  const source = yield* Source;
  return yield* Effect.validate(source.sourceFile.getExportDeclarations(), parseNamedExports).pipe(
    Effect.mapBoth({
      onFailure: (errors) => A.flatten(errors),
      onSuccess: (exports) => A.flatten(exports),
    })
  );
});

const parseModuleDeclaration: (
  moduleDeclaration: ast.ModuleDeclaration
) => Effect.Effect<Domain.Namespace, ReadonlyArray<string>, Source | Configuration.Configuration> = Effect.fn(
  function* (moduleDeclaration: ast.ModuleDeclaration) {
    const name = moduleDeclaration.getName();
    const info = yield* getDoc(name, getJSDocText(moduleDeclaration.getJsDocs())).pipe(Effect.mapError(A.of));
    const interfaces = yield* parseInterfaceDeclarations(moduleDeclaration.getInterfaces());
    const typeAliases = yield* parseTypeAliasDeclarations(moduleDeclaration.getTypeAliases());
    const namespaces = yield* parseModuleDeclarations(moduleDeclaration.getModules());
    return Domain.createNamespace(
      Domain.createNamedDoc(name, info.description, info.since, info.deprecated, info.examples, info.category),
      interfaces,
      typeAliases,
      namespaces
    );
  }
);

const parseModuleDeclarations = (
  namespaces: ReadonlyArray<ast.ModuleDeclaration>
): Effect.Effect<Array<Domain.Namespace>, ReadonlyArray<string>, Source | Configuration.Configuration> => {
  const exportedNamespaces = A.filter(
    namespaces,
    (namespace) => namespace.isExported() && shouldNotIgnore(namespace.getJsDocs())
  );
  return Effect.validate(exportedNamespaces, parseModuleDeclaration).pipe(
    Effect.mapBoth({
      onFailure: (errors) => A.flatten(errors),
      onSuccess: (values) => sortByName(values),
    })
  );
};

/**
 * Parses exported namespace declarations from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseNamespaces = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseModuleDeclarations(source.sourceFile.getModules());
});

const getTypeParameters = (typeParameters: ReadonlyArray<ast.TypeParameterDeclaration>): string =>
  pipe(
    typeParameters,
    A.matchLeft({
      onEmpty: thunkEmptyStr,
      onNonEmpty: () =>
        `<${pipe(
          typeParameters,
          A.map((parameter) => parameter.getName()),
          A.join(", ")
        )}>`,
    })
  );

const getMethodSignature = (method: ast.MethodDeclaration): string =>
  pipe(
    O.fromNullishOr(method.compilerNode.body),
    O.match({
      onNone: () => method.getText(),
      onSome: (body) => method.getText().substring(0, body.getStart() - method.getStart() - 1),
    })
  );

const parseMethod = Effect.fn(function* (method: ast.MethodDeclaration) {
  const overloads = method.getOverloads();
  const jsdocs = pipe(
    overloads,
    A.matchLeft({
      onEmpty: () => method.getJsDocs(),
      onNonEmpty: (firstOverload) => firstOverload.getJsDocs(),
    })
  );
  if (!shouldNotIgnore(jsdocs)) {
    return O.none<Domain.Method>();
  }
  const name = method.getName();
  const doc = yield* getDoc(name, getJSDocText(jsdocs));
  const signatures = pipe(
    overloads,
    A.matchRight({
      onEmpty: () => [getMethodSignature(method)],
      onNonEmpty: (init, last) =>
        pipe(
          init.map((overload) => overload.getText()),
          A.append(getMethodSignature(last))
        ),
    })
  );
  return O.some(
    Domain.createMethod(
      Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
      signatures
    )
  );
});

const parseProperty = (className: string) =>
  Effect.fn(function* (property: ast.PropertyDeclaration) {
    const name = property.getName();
    const doc = yield* getDoc(`${className}#${name}`, getJSDocText(property.getJsDocs()));
    const readonly = pipe(
      O.fromNullishOr(property.getFirstModifierByKind(ast.ts.SyntaxKind.ReadonlyKeyword)),
      O.match({
        onNone: thunkEmptyStr,
        onSome: () => "readonly ",
      })
    );
    return Domain.createProperty(
      Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
      `${readonly}${name}: ${stripImportTypes(property.getType().getText(property))}`
    );
  });

const parseProperties = (name: string, classDeclaration: ast.ClassDeclaration) => {
  const properties = A.filter(
    classDeclaration.getProperties(),
    (property) =>
      !property.isStatic() &&
      shouldNotIgnore(property.getJsDocs()) &&
      pipe(O.fromNullishOr(property.getFirstModifierByKind(ast.ts.SyntaxKind.PrivateKeyword)), O.isNone)
  );
  return Effect.validate(properties, parseProperty(name));
};

/**
 * Extracts the declaration signature for a class constructor.
 *
 * @internal
 * @param constructor The constructor declaration to render.
 * @returns The constructor signature without its implementation body.
 * @category Parsers
 * @since 0.0.0
 */
export const getConstructorDeclarationSignature = (constructor: ast.ConstructorDeclaration): string =>
  pipe(
    O.fromNullishOr(constructor.compilerNode.body),
    O.match({
      onNone: () => constructor.getText(),
      onSome: (body) => constructor.getText().substring(0, body.getStart() - constructor.getStart() - 1),
    })
  );

const getClassName = (classDeclaration: ast.ClassDeclaration) =>
  Effect.gen(function* () {
    const source = yield* Source;
    return yield* Effect.fromOption(O.fromNullishOr(classDeclaration.getName())).pipe(
      Effect.mapError(() => [`Missing ${chalk.bold("class name")} in module ${chalk.bold(source.path.join("/"))}`])
    );
  });

const getClassDoc = (name: string, classDeclaration: ast.ClassDeclaration) =>
  getDoc(name, getJSDocText(classDeclaration.getJsDocs())).pipe(Effect.mapError(A.of));

const getClassDeclarationSignature = (name: string, classDeclaration: ast.ClassDeclaration): string =>
  pipe(
    classDeclaration.getConstructors(),
    A.matchLeft({
      onEmpty: () => `export declare class ${name}${getTypeParameters(classDeclaration.getTypeParameters())}`,
      onNonEmpty: (constructor) =>
        `export declare class ${name}${getTypeParameters(classDeclaration.getTypeParameters())} { ${getConstructorDeclarationSignature(constructor)} }`,
    })
  );

const parseClass = Effect.fn(function* (classDeclaration: ast.ClassDeclaration) {
  const name = yield* getClassName(classDeclaration);
  const doc = yield* getClassDoc(name, classDeclaration);
  const methods = yield* pipe(
    classDeclaration.getInstanceMethods(),
    Effect.validate(parseMethod),
    Effect.map(A.getSomes)
  );
  const staticMethods = yield* pipe(
    classDeclaration.getStaticMethods(),
    Effect.validate(parseMethod),
    Effect.map(A.getSomes)
  );
  const properties = yield* parseProperties(name, classDeclaration);
  return Domain.createClass(
    Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category),
    getClassDeclarationSignature(name, classDeclaration),
    methods,
    staticMethods,
    properties
  );
});

/**
 * Parses exported classes from the active source file.
 *
 * @category parsers
 * @since 1.0.0
 */
export const parseClasses = Effect.gen(function* () {
  const source = yield* Source;
  const exportedClasses = A.filter(
    source.sourceFile.getClasses(),
    (classDeclaration) => classDeclaration.isExported() && shouldNotIgnore(classDeclaration.getJsDocs())
  );
  return yield* Effect.validate(exportedClasses, parseClass).pipe(
    Effect.mapBoth({
      onFailure: A.flatten,
      onSuccess: sortByName,
    })
  );
});

/**
 * Parses the leading file comment into module-level documentation metadata.
 *
 * @internal
 * @returns An effect that yields the module-level `NamedDoc` metadata.
 * @category Parsers
 * @since 0.0.0
 */
export const parseModuleDocumentation = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const source = yield* Source;
  const path = yield* Path.Path;
  const name = pipe(
    A.last(source.path),
    O.match({
      onNone: () => path.parse(source.sourceFile.getFilePath()).name,
      onSome: flow(path.parse, Struct.get("name")),
    })
  );
  const isDocumentationRequired = config.enforceDescriptions === true || config.enforceVersion === true;
  const firstStatement = pipe(source.sourceFile.getStatements(), A.head);
  if (O.isNone(firstStatement)) {
    if (isDocumentationRequired) {
      return yield* Effect.fail([`Empty ${chalk.bold(source.path.join("/"))} module`]);
    }
  } else {
    const maybeCommentRange = A.head(firstStatement.value.getLeadingCommentRanges());
    if (O.isNone(maybeCommentRange)) {
      if (isDocumentationRequired) {
        return yield* Effect.fail([
          `Missing ${chalk.bold("documentation")} in ${chalk.bold(source.path.join("/"))} module`,
        ]);
      }
    } else {
      const doc = yield* getDoc("<module fileoverview>", maybeCommentRange.value.getText(), true).pipe(
        Effect.mapError(A.of)
      );
      return Domain.createNamedDoc(name, doc.description, doc.since, doc.deprecated, doc.examples, doc.category);
    }
  }
  return Domain.createNamedDoc(name, O.none(), O.none(), false, [], O.none());
});

/**
 * Parses every documented export in the active source file into a module model.
 *
 * @category parsers
 * @since 1.0.0
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
  return Domain.createModule(
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
 * Creates a single-file parser bound to a prepared ts-morph project.
 *
 * @internal
 * @param project The project that already contains the files being parsed.
 * @returns A parser function for one file entry.
 * @category Parsers
 * @since 1.0.0
 */
export const parseFile = (project: ast.Project) =>
  Effect.fn(function* (file: File.File) {
    const path = yield* Path.Path;
    const sourceFile = project.getSourceFile(file.path);
    if (P.isNullish(sourceFile)) {
      return yield* Effect.fail([`Unable to locate file: ${file.path}`]);
    }
    return yield* parseModule.pipe(
      Effect.provideService(
        Source,
        Source.of({
          path: Str.split(path.sep)(file.path),
          sourceFile,
        })
      )
    );
  });

const getParseCompilerOptions = (value: Configuration.CompilerOptions) => (P.isString(value) ? {} : value);

const createProject = (files: ReadonlyArray<File.File>) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    const process = yield* Process.Process;
    const cwd = yield* process.cwd;
    const parsed = ast.ts.parseJsonConfigFileContent(
      {
        compilerOptions: {
          strict: true,
          moduleResolution: "node",
          ...getParseCompilerOptions(config.parseCompilerOptions),
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
 * Parses a collection of files into sorted module documentation models.
 *
 * @param files The files to parse.
 * @returns An effect that yields the parsed module models.
 * @category parsers
 * @since 1.0.0
 */
export const parseFiles = (files: ReadonlyArray<File.File>) =>
  createProject(files).pipe(
    Effect.flatMap((project) =>
      pipe(
        files,
        Effect.validate(parseFile(project)),
        Effect.map(flow(A.filter(P.not(Struct.get("deprecated"))), sortModulesByPath))
      )
    )
  );
