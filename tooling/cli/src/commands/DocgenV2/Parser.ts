/**
 *
 *
 * @module @beep/repo-cli/commands/DocgenV2/Parser
 * @since 0.0.0
 */
import chalk from "@beep/chalk";
import { $RepoCliId } from "@beep/identity/packages";
import { Category as CategorySchema, type Category as CategoryValue } from "@beep/repo-utils/JSDoc/models/index";
import { FilePath, SemanticVersion } from "@beep/schema";
import * as doctrine from "doctrine";
import { Effect, flow, Order, pipe, ServiceMap } from "effect";
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

const $I = $RepoCliId.create("commands/DocgenV2/Parser");

const SourceFile = S.declare((u: unknown): u is ast.SourceFile => u instanceof ast.SourceFile);

/** @internal */
export class SourceShape extends S.Class<SourceShape>($I`SourceShape`)({
  path: S.NonEmptyArray(FilePath),
  sourceFile: SourceFile,
}) {}

/** @internal */
export class Source extends ServiceMap.Service<Source, SourceShape>()($I`Source`) {}

export class Comment extends S.Class<Comment>($I`Comment`)(
  {
    description: S.Option(S.String),
    tags: S.Record(S.String, S.String.pipe(S.Option, S.NonEmptyArray)),
  },
  $I.annote("Comment", {
    description: "",
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

/**
 * @internal
 */
export const stripImportTypes = flow(Str.replace(/import\("((?!").)*"\)./g, ""));

const getJSDocText: (jsdocs: ReadonlyArray<ast.JSDoc>) => string = A.matchRight({
  onEmpty: () => "",
  onNonEmpty: (_, last) => last.getText(),
});

const hasTag: {
  (comment: Comment, tag: string): boolean;
  (tag: string): (comment: Comment) => boolean;
} = dual(2, (comment: Comment, tag: string) => pipe(comment.tags, R.get(tag), O.isSome));

const hasInternalTag = hasTag("internal");

const hasIgnoreTag = hasTag("ignore");

/**
 * @internal
 *
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
 * @internal
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

const parseFunctionDeclarations = (functions: ReadonlyArray<ast.FunctionDeclaration>) => {
  const exportedFunctions = A.filter(
    functions,
    (fd) => fd.isExported() && shouldNotIgnore(getFunctionDeclarationJSDocs(fd))
  );
  return Effect.validate(exportedFunctions, parseFunctionDeclaration).pipe(Effect.map(sortByName));
};

/**
 * @category parsers
 * @since 1.0.0
 */
export const parseFunctions = Effect.gen(function* () {
  const source = yield* Source;
  return yield* parseFunctionDeclarations(source.sourceFile.getFunctions());
});
