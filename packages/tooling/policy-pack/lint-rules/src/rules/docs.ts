/**
 * Repo-owned JSDoc content and public declaration rules for oxlint.
 *
 * @packageDocumentation
 * @since 0.1.0
 */
import { $LintRulesId } from "@beep/identity/packages";
import { defineRule } from "@oxlint/plugins";
import { areDocsInformative } from "are-docs-informative";
import { parse, tokenizers } from "comment-parser";
import * as A from "effect/Array";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { Context, ESTree, Visitor } from "@oxlint/plugins";
import type { Block, Spec } from "comment-parser";
import type { DocsRuleId } from "./docs.model.ts";

const $I = $LintRulesId.create("rules/docs-content");
const CategoryComment = S.String.check(S.isPattern(/@category\s+\S+/u)).pipe(
  $I.annoteSchema("CategoryComment", { description: "Documentation containing a nonempty category tag." })
);
const AttachedJSDocText = S.String.check(S.isPattern(/^\*\s/u)).pipe(
  $I.annoteSchema("AttachedJSDocText", { description: "A standard JSDoc opener followed by whitespace." })
);
const isAttachedJSDocText = S.is(AttachedJSDocText);
const declarationTypes = HashSet.fromIterable([
  "FunctionDeclaration",
  "TSDeclareFunction",
  "ClassDeclaration",
  "VariableDeclaration",
  "TSTypeAliasDeclaration",
  "TSInterfaceDeclaration",
  "TSMethodSignature",
  "TSPropertySignature",
]);
const ignoredDescriptionTags = HashSet.fromIterable(["inheritdoc", "inheritDoc"]);
const preferences = HashMap.fromIterable([
  ["return", "returns"],
  ["augments", "extends"],
]);
const parsed = (comment: ESTree.Comment): O.Option<Block> =>
  A.head(
    parse(`/*${comment.value}*/`, {
      spacing: "preserve",
      tokenizers: [
        tokenizers.tag(),
        (spec) => (HashSet.has(noTypeTags, spec.tag) ? spec : tokenizers.type("preserve")(spec)),
        (spec) => (HashSet.has(noNameTags, spec.tag) ? spec : tokenizers.name()(spec)),
        tokenizers.description("preserve"),
      ],
    })
  );
const isDoc = (comment: ESTree.Comment): boolean => comment.type === "Block" && Str.startsWith("*")(comment.value);
const commentsBefore = (context: Context, node: ESTree.Node): ReadonlyArray<ESTree.Comment> =>
  A.filter(context.sourceCode.getCommentsBefore(node), isDoc);
const parentOf = (node: ESTree.Node): O.Option<ESTree.Node> => O.fromNullishOr(node.parent);
const isExport = (node: ESTree.Node): boolean =>
  node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration";
const candidates = (node: ESTree.Node): ReadonlyArray<ESTree.Node> =>
  A.getSomes([O.some(node), parentOf(node), O.flatMap(parentOf(node), parentOf)]);
const documentationCandidates = (node: ESTree.Node): ReadonlyArray<ESTree.Node> =>
  A.filter(
    candidates(node),
    (candidate: ESTree.Node): boolean =>
      candidate === node || isExport(candidate) || candidate.type === "VariableDeclaration"
  );
const docsFor = (context: Context, node: ESTree.Node): ReadonlyArray<ESTree.Comment> =>
  A.flatMap(documentationCandidates(node), (candidate) => commentsBefore(context, candidate));
const hasAttachedDocumentation = (context: Context, node: ESTree.Node): boolean =>
  A.some(documentationCandidates(node), (candidate) => {
    const comments = context.sourceCode.getCommentsBefore(candidate);
    const block = A.findLast(comments, (comment) => comment.type === "Block");
    if (O.isNone(block) || !isAttachedJSDocText(block.value.value)) return false;
    const following = A.findFirst(comments, (comment) => comment.range[0] >= block.value.range[1]);
    const line = following.pipe(
      O.map((comment) => comment.loc.start.line),
      O.getOrElse(() => candidate.loc.start.line)
    );
    return line - block.value.loc.end.line <= 1;
  });
const hasPublicDocumentation = (context: Context, node: ESTree.Node): boolean => {
  let current = node;
  while (true) {
    if (hasAttachedDocumentation(context, current)) return true;
    if ((current.type !== "FunctionDeclaration" && current.type !== "TSDeclareFunction") || current.id === null)
      return false;
    const outer = isExport(current.parent) ? current.parent : current;
    const parent = outer.parent;
    if (parent === null || (parent.type !== "Program" && parent.type !== "BlockStatement")) return false;
    const statements: ReadonlyArray<ESTree.Node> = parent.body;
    const previous = A.findLast(statements, (statement) => statement.range[1] <= outer.range[0]);
    if (O.isNone(previous)) return false;
    const declaration = previous.value.type === "ExportNamedDeclaration" ? previous.value.declaration : previous.value;
    if (
      declaration === null ||
      (declaration.type !== "FunctionDeclaration" && declaration.type !== "TSDeclareFunction") ||
      declaration.body !== null ||
      declaration.id?.name !== current.id.name
    )
      return false;
    current = declaration;
  }
};
const exported = (node: ESTree.Node): boolean => A.some(A.drop(candidates(node), 1), isExport);

const namesOf = (node: ESTree.Node): ReadonlyArray<string> => {
  if (node.type === "Identifier") return [node.name];
  if (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration") {
    return O.match(O.fromNullishOr(node.declaration), { onNone: () => [], onSome: namesOf });
  }
  if (node.type === "VariableDeclaration") return A.flatMap(node.declarations, namesOf);
  if (node.type === "VariableDeclarator") {
    return [...namesOf(node.id), ...O.match(O.fromNullishOr(node.init), { onNone: () => [], onSome: namesOf })];
  }
  if (node.type === "MethodDefinition" || node.type === "PropertyDefinition" || node.type === "Property") {
    return [
      ...O.match(O.flatMap(parentOf(node), parentOf), { onNone: () => [], onSome: namesOf }),
      ...namesOf(node.key),
    ];
  }
  if ("id" in node && P.isObject(node.id) && "type" in node.id) {
    // Named declarations expose a nullable identifier at this AST boundary.
    if (node.id.type === "Identifier" && "name" in node.id && P.isString(node.id.name)) return [node.id.name];
  }
  return [];
};

const functionOf = (node: ESTree.Node): O.Option<ESTree.Function | ESTree.ArrowFunctionExpression> => {
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "TSDeclareFunction" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  )
    return O.some(node);
  if (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration")
    return O.flatMap(O.fromNullishOr(node.declaration), functionOf);
  if (node.type === "VariableDeclaration") return O.flatMap(A.head(node.declarations), functionOf);
  if (node.type === "VariableDeclarator") return O.flatMap(O.fromNullishOr(node.init), functionOf);
  if (node.type === "MethodDefinition") return O.some(node.value);
  return O.none();
};
const parameterName = (node: ESTree.Node): O.Option<string> => {
  if (node.type === "Identifier") return O.some(node.name);
  if (node.type === "AssignmentPattern") return parameterName(node.left);
  if (node.type === "RestElement") return parameterName(node.argument);
  if (node.type === "TSParameterProperty") return parameterName(node.parameter);
  return O.none();
};
const parameterNodes = (node: ESTree.Node): O.Option<ReadonlyArray<ESTree.ParamPattern>> => {
  if (node.type === "TSMethodSignature") return O.some(node.params);
  if (node.type === "TSPropertySignature") {
    const annotation = node.typeAnnotation?.typeAnnotation;
    if (annotation?.type === "TSFunctionType") return O.some(annotation.params);
  }
  return O.map(functionOf(node), (fn) => fn.params);
};
const tagsNamed = (block: Block, tag: string): ReadonlyArray<Spec> =>
  A.filter(block.tags, (entry) => entry.tag === tag);
const blank = (text: string): boolean => Str.isEmpty(Str.trim(text));
const informative = (text: string, names: ReadonlyArray<string>): boolean =>
  blank(text) ||
  areDocsInformative(Str.trim(text), A.join(names, " "), {
    aliases: { a: ["an", "our"] },
    uselessWords: ["a", "an", "i", "in", "of", "s", "the"],
  });

// This mirrors the old publicOnly behavior for declarations reached by export specifiers,
// default exports, and public class methods; constructors and private methods are exempt.
const publicVisitor = (check: (node: ESTree.Node) => void): Visitor => {
  let publicNames = HashSet.empty<string>();
  const isModulePublic = (node: ESTree.Node): boolean =>
    node.parent?.type === "Program" && A.some(namesOf(node), (name) => HashSet.has(publicNames, name));
  const isPublicClass = (node: ESTree.Node): boolean =>
    exported(node) ||
    isModulePublic(node) ||
    (node.type === "ClassExpression" &&
      O.exists(
        parentOf(node),
        (parent) =>
          parent.type === "VariableDeclarator" && (exported(parent) || O.exists(parentOf(parent), isModulePublic))
      ));
  return {
    Program(program) {
      for (const statement of program.body) {
        if (statement.type === "ExportNamedDeclaration" && statement.source === null) {
          for (const specifier of statement.specifiers)
            publicNames = HashSet.add(publicNames, contextName(specifier.local));
        }
        if (statement.type === "ExportDefaultDeclaration" && statement.declaration.type === "Identifier") {
          publicNames = HashSet.add(publicNames, statement.declaration.name);
        }
      }
    },
    ":matches(FunctionDeclaration, ClassDeclaration, VariableDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration)"(
      node
    ) {
      if (
        exported(node) ||
        ((node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") && isModulePublic(node))
      )
        check(node);
    },
    MethodDefinition(node) {
      if (node.kind === "constructor" || node.accessibility === "private" || node.key.type === "PrivateIdentifier")
        return;
      const owner = O.flatMap(parentOf(node), parentOf);
      if (O.exists(owner, isPublicClass)) check(node);
    },
  };
};

/**
 * Build one content or declaration documentation rule without an ESLint dependency.
 *
 * **Example** (Inspect a documentation rule)
 * ```ts
 * import { docsRule } from "@beep/lint-rules/oxlint-docs"
 * console.log(docsRule("require-jsdoc").meta?.type)
 * ```
 * @param id - Documentation rule identifier.
 * @returns The oxlint rule implementation.
 * @category tools
 * @since 0.1.0
 */
export const docsRule = (id: Exclude<DocsRuleId, "tsdoc-syntax">) =>
  defineRule({
    meta: { type: "problem", docs: { description: `Repository documentation policy: ${id}.` } },
    create(context) {
      const report = (comment: ESTree.Comment, message: string) => context.report({ loc: comment.loc, message });
      if (id === "require-jsdoc") {
        return publicVisitor((node) => {
          if (!hasPublicDocumentation(context, node)) context.report({ node, message: "Missing JSDoc comment." });
        });
      }
      if (id === "require-category-tag" || id === "require-description") {
        return {
          ":matches(FunctionDeclaration, ClassDeclaration, VariableDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration)"(
            node
          ) {
            if (!exported(node)) return;
            const comments =
              id === "require-description" && node.type === "VariableDeclaration"
                ? commentsBefore(context, node)
                : docsFor(context, node);
            if (id === "require-category-tag") {
              if (!A.some(comments, (comment) => S.is(CategoryComment)(comment.value))) {
                context.report({
                  node,
                  message: `Exported symbol '${A.head(namesOf(node)).pipe(O.getOrElse(() => "exported symbol"))}' must include a @category tag in its JSDoc block.`,
                });
              }
            } else if (
              A.isReadonlyArrayNonEmpty(comments) &&
              !A.some(comments, (comment) =>
                O.exists(
                  parsed(comment),
                  (block) =>
                    !blank(block.description) ||
                    A.some(block.tags, (tag) => HashSet.has(ignoredDescriptionTags, tag.tag))
                )
              )
            ) {
              if (!Str.includes("/tag-values/")(context.filename))
                context.report({ node, message: "Missing JSDoc block description." });
            }
          },
        };
      }
      return {
        Program() {
          const comments = A.filter(context.sourceCode.getAllComments(), isDoc);
          if (id === "require-file-overview") {
            if (!Str.endsWith("/src/index.ts")(context.filename)) return;
            const firstToken = context.sourceCode.getFirstToken(context.sourceCode.ast);
            if (
              !A.some(
                comments,
                (comment) =>
                  (firstToken === null || comment.range[1] <= firstToken.range[0]) &&
                  Str.includes("@packageDocumentation")(comment.value)
              )
            ) {
              context.report({
                node: context.sourceCode.ast,
                message: "Missing initial @packageDocumentation overview.",
              });
            }
            return;
          }
          for (const comment of comments) {
            const result = parsed(comment);
            if (O.isNone(result)) continue;
            const block = result.value;
            const token = context.sourceCode.getTokenAfter(comment);
            const attached = O.flatMap(
              O.filter(
                O.fromNullishOr(token),
                (value) =>
                  !A.some(comments, (other) => other.range[0] > comment.range[0] && other.range[1] <= value.range[0])
              ),
              (value) => O.fromNullishOr(context.sourceCode.getNodeByRangeIndex(value.range[0]))
            );
            const node = O.flatMap(attached, (value) =>
              A.findFirst(
                candidates(value),
                (candidate) =>
                  HashSet.has(declarationTypes, candidate.type) ||
                  isExport(candidate) ||
                  O.isSome(functionOf(candidate))
              )
            );
            const names = O.match(node, { onNone: () => [], onSome: namesOf });
            if (id === "informative-docs") {
              if (!informative(block.description, names))
                report(comment, "This description only repeats the name it describes.");
              for (const tag of block.tags)
                if (!informative(tag.description, [...names, tag.name]))
                  report(comment, "This tag description only repeats the name it describes.");
            }
            if (id === "no-blank-block-descriptions") {
              const lines = A.takeWhile(
                A.drop(block.source, 1),
                (line) => blank(line.tokens.tag) && blank(line.tokens.end)
              );
              const leading = A.length(A.takeWhile(lines, (line) => blank(line.tokens.description)));
              const removable = block.tags.length > 0 ? leading : leading === lines.length ? leading - 1 : leading;
              if (removable > 0)
                report(comment, "There should be no extra blank lines at the start of block descriptions.");
            }
            if (id === "check-tag-names") {
              for (const match of Str.matchAll(/\{@(\w+)/gu)(comment.value)) {
                const tag = match[1];
                if (tag !== undefined && !HashSet.has(inlineTags, tag))
                  report(comment, `Invalid JSDoc inline tag name '${tag}'.`);
              }
              for (const tag of block.tags) {
                if (!HashSet.has(validTags, tag.tag)) report(comment, `Invalid JSDoc tag name '${tag.tag}'.`);
                const preference = HashMap.get(preferences, tag.tag);
                if (O.isSome(preference))
                  report(comment, `Invalid JSDoc tag (preference). Replace '${tag.tag}' with '${preference.value}'.`);
              }
            }
            if (
              id === "match-description" &&
              O.isSome(O.flatMap(node, functionOf)) &&
              !Str.includes("/tag-values/")(context.filename)
            ) {
              if (!blank(block.description) && Str.trim(block.description).length < 20)
                report(comment, "JSDoc description must be at least 20 characters.");
              for (const tag of block.tags)
                if (
                  (tag.tag === "param" || tag.tag === "returns") &&
                  !blank(tag.description) &&
                  Str.trim(tag.description).length < 5
                )
                  report(comment, `${tag.tag} description must be at least 5 characters.`);
            }
            if (
              (id === "require-param-description" || id === "require-returns-description") &&
              O.isSome(O.flatMap(node, functionOf))
            ) {
              const tagName = id === "require-param-description" ? "param" : "returns";
              for (const tag of tagsNamed(block, tagName))
                if (blank(tag.description)) report(comment, `Missing JSDoc @${tagName} description.`);
            }
            const fn = O.flatMap(node, functionOf);
            const parameters =
              id === "check-param-names" ? O.flatMap(node, parameterNodes) : O.map(fn, (value) => value.params);
            if (O.isNone(parameters)) continue;
            const params = tagsNamed(block, "param");
            const roots = A.filter(params, (tag) => !Str.includes(".")(tag.name));
            const actual = A.map(roots, (tag) => tag.name);
            const expected = A.map(parameters.value, parameterName);
            if (id === "check-param-names") {
              let seen = HashSet.empty<string>();
              let invalid = false;
              for (const tag of params) {
                if (HashSet.has(seen, tag.name)) {
                  report(comment, `Duplicate @param '${tag.name}'.`);
                  invalid = true;
                  break;
                }
                seen = HashSet.add(seen, tag.name);
              }
              if (invalid) continue;
              const filtered = A.filter(expected, (name) => !(O.contains(name, "this") && !A.contains(actual, "this")));
              for (const [index, tag] of A.map(roots, (tag, index): readonly [number, Spec] => [index, tag])) {
                const name = A.get(filtered, index);
                if (O.isNone(name)) {
                  report(comment, `@param '${tag.name}' does not match an existing function parameter.`);
                  invalid = true;
                  break;
                }
                if (O.exists(name.value, (value) => value !== tag.name)) {
                  report(
                    comment,
                    `Expected @param name to be '${O.getOrElse(name.value, () => "")}'. Got '${tag.name}'.`
                  );
                  invalid = true;
                  break;
                }
              }
              if (invalid) continue;
              let lastRoot = O.none<string>();
              for (const tag of params) {
                if (!Str.includes(".")(tag.name)) {
                  lastRoot = O.some(tag.name);
                  continue;
                }
                const root = Str.replace(/\[\]$/u, "")(A.head(Str.split(tag.name, ".")).pipe(O.getOrElse(() => "")));
                if (!O.contains(lastRoot, root)) {
                  report(comment, `@param path '${tag.name}' must follow its real parameter '${root}'.`);
                  break;
                }
              }
            }
            if (id === "require-param" && !A.some(block.tags, (tag) => HashSet.has(ignoredDescriptionTags, tag.tag))) {
              for (const name of A.getSomes(expected))
                if (name !== "this" && !A.contains(actual, name))
                  report(comment, `Missing JSDoc @param '${name}' declaration.`);
            }
            if (
              id === "require-returns" &&
              O.isSome(fn) &&
              !A.some(block.tags, (tag) => HashSet.has(ignoredDescriptionTags, tag.tag)) &&
              A.isReadonlyArrayEmpty(tagsNamed(block, "returns"))
            ) {
              const returnType = fn.value.returnType?.typeAnnotation;
              const returnsValue =
                fn.value.async ||
                (fn.value.type === "ArrowFunctionExpression" && fn.value.body?.type !== "BlockStatement") ||
                (returnType !== undefined &&
                  returnType.type !== "TSVoidKeyword" &&
                  returnType.type !== "TSNeverKeyword") ||
                Str.includes("return ")(
                  O.match(O.fromNullishOr(fn.value.body), { onNone: () => "", onSome: context.sourceCode.getText })
                );
              if (returnsValue) report(comment, "Missing JSDoc @returns declaration.");
            }
          }
        },
      };
    },
  });

// Vocabulary from eslint-plugin-jsdoc TypeScript mode; aliases remain accepted except explicit preferences.
const validTags = HashSet.fromIterable([
  "modifies",
  "abstract",
  "virtual",
  "access",
  "alias",
  "async",
  "augments",
  "extends",
  "author",
  "borrows",
  "callback",
  "class",
  "constructor",
  "classdesc",
  "constant",
  "const",
  "constructs",
  "copyright",
  "default",
  "defaultvalue",
  "deprecated",
  "description",
  "desc",
  "enum",
  "event",
  "example",
  "exports",
  "external",
  "host",
  "file",
  "fileoverview",
  "overview",
  "fires",
  "emits",
  "function",
  "func",
  "method",
  "generator",
  "global",
  "hideconstructor",
  "ignore",
  "implements",
  "inheritdoc",
  "inheritDoc",
  "inner",
  "instance",
  "interface",
  "kind",
  "lends",
  "license",
  "listens",
  "member",
  "var",
  "memberof",
  "memberof!",
  "mixes",
  "mixin",
  "module",
  "name",
  "namespace",
  "override",
  "package",
  "param",
  "arg",
  "argument",
  "private",
  "property",
  "prop",
  "protected",
  "public",
  "readonly",
  "requires",
  "returns",
  "return",
  "see",
  "since",
  "static",
  "summary",
  "this",
  "throws",
  "exception",
  "todo",
  "tutorial",
  "type",
  "typedef",
  "variation",
  "version",
  "yields",
  "yield",
  "alpha",
  "beta",
  "decorator",
  "eventProperty",
  "experimental",
  "packageDocumentation",
  "privateRemarks",
  "remarks",
  "sealed",
  "category",
  "categoryDescription",
  "disableGroups",
  "document",
  "expand",
  "expandType",
  "group",
  "groupDescription",
  "hidden",
  "hideCategories",
  "hideGroups",
  "inline",
  "inlineType",
  "mergeModuleWith",
  "preventExpand",
  "preventInline",
  "primaryExport",
  "showCategories",
  "showGroups",
  "sortStrategy",
  "useDeclaredType",
  "import",
  "internal",
  "jsx",
  "overload",
  "satisfies",
  "template",
  "typeParam",
  "domain",
  "provides",
  "depends",
  "errors",
  "effects",
  "precondition",
  "postcondition",
  "invariant",
]);

const noNameTags = HashSet.fromIterable([
  "access",
  "author",
  "default",
  "defaultvalue",
  "description",
  "example",
  "exception",
  "file",
  "fileoverview",
  "kind",
  "license",
  "overview",
  "return",
  "returns",
  "since",
  "summary",
  "throws",
  "version",
  "variation",
]);
const noTypeTags = HashSet.fromIterable([
  "default",
  "defaultvalue",
  "description",
  "example",
  "file",
  "fileoverview",
  "license",
  "overview",
  "see",
  "summary",
]);
const contextName = (name: ESTree.ModuleExportName): string => (name.type === "Identifier" ? name.name : name.value);

const inlineTags = HashSet.fromIterable([
  "link",
  "linkcode",
  "linkplain",
  "tutorial",
  "inheritDoc",
  "label",
  "include",
  "includeCode",
]);
