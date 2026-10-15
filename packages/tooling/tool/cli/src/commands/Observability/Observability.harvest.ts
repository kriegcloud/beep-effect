/**
 * Syntax-only span-name harvesting over ts-morph source files.
 *
 * **Details**
 *
 * The harvester reads the name argument of every `Effect.fn`,
 * `Effect.fnUntraced` and `Effect.withSpan` call. String literals and
 * top-level `const` string bindings in the same file are recorded as span sites; template
 * literals with substitutions are `interpolated` findings; any other
 * expression is a `non-literal` finding.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { PackageFamily } from "@beep/observability/catalog";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Node, SyntaxKind } from "ts-morph";
import { SpanCallee, SpanHarvest, SpanNameFinding, SpanSite } from "./Observability.schemas.ts";
import type { PackageName } from "@beep/observability/catalog";
import type { PosixPath } from "@beep/schema/PosixPath";
import type { CallExpression, SourceFile } from "ts-morph";

const isSpanCallee = S.is(SpanCallee);

const familyPrefixes: ReadonlyArray<readonly [string, PackageFamily]> = [
  ["apps/labs/", PackageFamily.Enum.lab],
  ["apps/", PackageFamily.Enum.app],
  ["packages/foundation/", PackageFamily.Enum.foundation],
  ["packages/drivers/", PackageFamily.Enum.driver],
  ["packages/tooling/", PackageFamily.Enum.tooling],
  ["packages/_internal/", PackageFamily.Enum.tooling],
  ["packages/ecosystem/", PackageFamily.Enum.ecosystem],
];

/**
 * Package family for a repo-relative path.
 *
 * **Details**
 *
 * `apps/labs/**` is `lab`, other `apps/**` is `app`; `packages/foundation`,
 * `packages/drivers`, `packages/tooling` and `packages/ecosystem` map to
 * their family; `packages/_internal` is tooling; every other `packages/<dir>`
 * is a slice.
 *
 * **Example** (Derive families from paths)
 *
 * ```ts
 * import { packageFamilyOfPath } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(packageFamilyOfPath("packages/drivers/box/src/Box.ts")) // "driver"
 * console.log(packageFamilyOfPath("packages/documents/server/src/Doc.ts")) // "slice"
 * console.log(packageFamilyOfPath("apps/labs/semantica/src/App.ts")) // "lab"
 * ```
 *
 * @param file - Repository-relative source path to classify.
 * @returns The package family inferred from the path.
 * @category getters
 * @since 0.0.0
 */
export const packageFamilyOfPath = (file: string): PackageFamily =>
  O.getOrElse(
    O.map(
      A.findFirst(familyPrefixes, ([prefix]) => Str.startsWith(prefix)(file)),
      ([, family]) => family
    ),
    () => PackageFamily.Enum.slice
  );

// Local names bound to `effect/Effect` in one file: namespace aliases (`import * as Eff`) and named
// members (`import { withSpan as ws }`). The bare `Effect` identifier is always accepted, so files that
// rely on an ambient or re-exported `Effect` namespace still harvest.
interface EffectBindings {
  readonly members: HashMap.HashMap<string, string>;
  readonly namespaces: HashSet.HashSet<string>;
}

const effectBindings = (sourceFile: SourceFile): EffectBindings => {
  const imports = A.filter(
    sourceFile.getImportDeclarations(),
    (declaration) => declaration.getModuleSpecifierValue() === "effect/Effect"
  );
  return {
    namespaces: HashSet.fromIterable(
      A.append(
        A.flatMap(imports, (declaration) =>
          O.toArray(O.map(O.fromUndefinedOr(declaration.getNamespaceImport()), (alias) => alias.getText()))
        ),
        "Effect"
      )
    ),
    members: HashMap.fromIterable(
      A.flatMap(imports, (declaration) =>
        A.map(
          declaration.getNamedImports(),
          (specifier) => [specifier.getAliasNode()?.getText() ?? specifier.getName(), specifier.getName()] as const
        )
      )
    ),
  };
};

const calleeOf =
  (bindings: EffectBindings) =>
  (call: CallExpression): O.Option<SpanCallee> => {
    const expression = call.getExpression();
    if (Node.isPropertyAccessExpression(expression)) {
      const receiver = expression.getExpression();
      return Node.isIdentifier(receiver) && HashSet.has(bindings.namespaces, receiver.getText())
        ? O.liftPredicate(`Effect.${expression.getName()}`, isSpanCallee)
        : O.none();
    }
    return Node.isIdentifier(expression)
      ? O.flatMap(HashMap.get(bindings.members, expression.getText()), (member) =>
          O.liftPredicate(`Effect.${member}`, isSpanCallee)
        )
      : O.none();
  };

const isStringLike = (node: Node): boolean =>
  Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node) || Node.isTemplateExpression(node);

const isFunctionLike = (node: Node): boolean => Node.isFunctionExpression(node) || Node.isArrowFunction(node);

const nameArgument = (callee: SpanCallee, call: CallExpression): O.Option<Node> => {
  const args = call.getArguments();
  const first = O.fromUndefinedOr(args[0]);
  if (callee !== SpanCallee.Enum["Effect.withSpan"]) {
    return O.filter(first, (node) => !isFunctionLike(node));
  }
  const second = O.fromUndefinedOr(args[1]);
  const dataFirst = O.isSome(first) && !isStringLike(first.value) && O.isSome(second) && isStringLike(second.value);
  return dataFirst ? second : first;
};

const constStringValue = (node: Node): O.Option<string> => {
  if (!Node.isIdentifier(node)) {
    return O.none();
  }
  return O.flatMap(O.fromUndefinedOr(node.getSourceFile().getVariableDeclaration(node.getText())), (declaration) => {
    const initializer = declaration.getInitializer();
    return initializer !== undefined &&
      (Node.isStringLiteral(initializer) || Node.isNoSubstitutionTemplateLiteral(initializer)) &&
      declaration.getVariableStatement()?.getDeclarationKind() === "const"
      ? O.some(initializer.getLiteralValue())
      : O.none();
  });
};

const literalValue = (node: Node): O.Option<string> =>
  Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)
    ? O.some(node.getLiteralValue())
    : constStringValue(node);

/**
 * Harvests span sites and findings from one source file.
 *
 * **Example** (Harvest an in-memory file)
 *
 * ```ts
 * import { PackageName } from "@beep/observability/catalog"
 * import { PosixPath } from "@beep/schema/PosixPath"
 * import { Project } from "ts-morph"
 * import { harvestSourceFile } from "@beep/repo-cli/commands/Observability"
 *
 * const project = new Project({ useInMemoryFileSystem: true })
 * const file = project.createSourceFile("a.ts", 'const f = Effect.fn("Parcels.read")(function* () {})')
 * const harvest = harvestSourceFile(file, PosixPath.make("packages/parcels/src/a.ts"), PackageName.make("@beep/parcels"))
 * console.log(harvest.sites[0]?.name) // "Parcels.read"
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const harvestSourceFile: {
  (file: PosixPath, owner: PackageName): (sourceFile: SourceFile) => SpanHarvest;
  (sourceFile: SourceFile, file: PosixPath, owner: PackageName): SpanHarvest;
} = dual(3, (sourceFile: SourceFile, file: PosixPath, owner: PackageName): SpanHarvest => {
  const family = packageFamilyOfPath(file);
  const calleeIn = calleeOf(effectBindings(sourceFile));
  const named = A.flatMap(sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression), (call) =>
    O.match(
      O.flatMap(calleeIn(call), (callee) => O.map(nameArgument(callee, call), (argument) => ({ argument, callee }))),
      {
        onNone: () => [],
        onSome: ({ argument, callee }) => [{ argument, callee, line: call.getStartLineNumber() }],
      }
    )
  );
  const sites = A.flatMap(named, ({ argument, callee, line }) =>
    O.match(O.filter(literalValue(argument), Str.isNonEmpty), {
      onNone: () => [],
      onSome: (name) => [SpanSite.make({ name, owner, family, file, line, callee })],
    })
  );
  const findings = A.flatMap(named, ({ argument, callee, line }) =>
    O.isSome(literalValue(argument))
      ? []
      : [
          SpanNameFinding.make({
            kind: Node.isTemplateExpression(argument) ? "interpolated" : "non-literal",
            file,
            line,
            callee,
            text: argument.getText(),
          }),
        ]
  );
  return SpanHarvest.make({ sites, findings });
});

/**
 * Concatenates harvests from many files.
 *
 * **Example** (Combine two empty harvests)
 *
 * ```ts
 * import { SpanHarvest, combineHarvests } from "@beep/repo-cli/commands/Observability"
 *
 * const empty = SpanHarvest.make({ sites: [], findings: [] })
 * console.log(combineHarvests([empty, empty]).sites.length) // 0
 * ```
 *
 * @param harvests - Harvests whose sites and findings are combined in input order.
 * @returns A harvest containing all supplied sites and findings.
 * @category combinators
 * @since 0.0.0
 */
export const combineHarvests = (harvests: ReadonlyArray<SpanHarvest>): SpanHarvest =>
  SpanHarvest.make({
    sites: A.flatMap(harvests, (harvest) => harvest.sites),
    findings: A.flatMap(harvests, (harvest) => harvest.findings),
  });
