/**
 * Type-aware regression gate for strict equality of generated Opaque samples.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils/Root";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import { Command } from "effect/cli";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import { identity } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";
import { Project, ts } from "ts-morph";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.ts";
import { runGitPathList } from "../../internal/repo-run/GitExec.ts";

const $I = $RepoCliId.create("commands/Lint/OpaqueRoundtrips");

/**
 * One assertion comparing a raw generated sample with a freshly built Opaque value.
 *
 * **Example** (Describe an unsafe assertion)
 * ```ts
 * import { OpaqueRoundtripFinding } from "@beep/repo-cli/commands/Lint/OpaqueRoundtrips"
 * console.log(OpaqueRoundtripFinding.make({ file: "a.test.ts", line: 1, opaque: ["Value"], text: "expect(decoded).toStrictEqual(sample)" }).line)
 * ```
 * @category diagnostics
 * @since 0.0.0
 */
export class OpaqueRoundtripFinding extends S.Opaque<OpaqueRoundtripFinding, { readonly brand: unique symbol }>()(
  S.Struct({ file: S.String, line: S.Int, opaque: S.Array(S.String), text: S.String }).pipe(
    $I.annoteSchema("OpaqueRoundtripFinding", {
      description: "Location, Opaque classes and text of an unsafe generated-sample assertion.",
    })
  )
) {}

/**
 * Opaque roundtrip source discovery or compiler failure.
 *
 * **Example** (Describe a scan failure)
 * ```ts
 * import { OpaqueRoundtripsError } from "@beep/repo-cli/commands/Lint/OpaqueRoundtrips"
 * console.log(OpaqueRoundtripsError.make({ message: "Unable to inspect", cause: "boom" })._tag)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class OpaqueRoundtripsError extends S.TaggedError<OpaqueRoundtripsError, { readonly brand: unique symbol }>()(
  $I`OpaqueRoundtripsError`,
  { message: S.String, cause: S.Defect() },
  $I.annoteError<OpaqueRoundtripsError>("OpaqueRoundtripsError", {
    description: "Opaque roundtrip source discovery or compiler failure.",
  })
) {}

const failure = (message: string) => (cause: unknown) => OpaqueRoundtripsError.make({ message, cause });
const isOpaqueClass = (symbol: ts.Symbol | undefined): boolean =>
  A.some(
    symbol?.declarations ?? [],
    (declaration) =>
      ts.isClassDeclaration(declaration) &&
      A.some(declaration.heritageClauses ?? [], (clause) =>
        A.some(clause.types, (type) => /\.Opaque\s*</.test(type.expression.getText()))
      )
  );

const isReference = (type: ts.Type): type is ts.TypeReference =>
  (type.flags & ts.TypeFlags.Object) !== 0 && "target" in type;

const opaqueNames = (checker: ts.TypeChecker, root: ts.Type): ReadonlyArray<string> => {
  let found = HashSet.empty<string>();
  let seen = HashSet.empty<ts.Type>();
  const visit = (type: ts.Type, depth: number): void => {
    // Compiler types are mutable graphs; preserve the prototype scanner's reference identity.
    if (depth > 8 || HashSet.has(seen, Equal.byReferenceUnsafe(type))) return;
    seen = HashSet.add(seen, type);
    if (type.isUnionOrIntersection()) {
      for (const member of type.types) visit(member, depth + 1);
      return;
    }
    const symbol = type.getSymbol();
    if (isOpaqueClass(symbol)) found = HashSet.add(found, symbol?.getName() ?? "?");
    if ((checker.isArrayType(type) || checker.isTupleType(type)) && isReference(type)) {
      for (const argument of checker.getTypeArguments(type)) visit(argument, depth + 1);
      return;
    }
    if ((type.flags & ts.TypeFlags.Object) === 0) return;
    for (const property of checker.getPropertiesOfType(type)) {
      if (property.getName() === "brand") continue;
      const declaration = property.valueDeclaration ?? property.declarations?.[0];
      if (declaration !== undefined) visit(checker.getTypeOfSymbolAtLocation(property, declaration), depth + 1);
    }
  };
  visit(root, 0);
  return A.sort(found, Order.String);
};

const bindingNames = (name: ts.BindingName, names: HashSet.HashSet<string>): HashSet.HashSet<string> => {
  if (ts.isIdentifier(name)) return HashSet.add(names, name.text);
  let result = names;
  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) result = bindingNames(element.name, result);
  }
  return result;
};

// Preserve the prototype scanner's call boundary: even an identity call is treated as fresh.
const rawSample = (node: ts.Node, names: HashSet.HashSet<string>): boolean => {
  let found = false;
  const visit = (child: ts.Node): void => {
    if (found || ts.isCallExpression(child)) return;
    if (ts.isIdentifier(child) && HashSet.has(names, child.text)) found = true;
    else ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
};

/**
 * Detect unsafe assertions in compiler sources using the prototype scanner's exact rule.
 *
 * **Example** (Scan an empty compiler program)
 * ```ts
 * import { detectOpaqueRoundtrips } from "@beep/repo-cli/commands/Lint/OpaqueRoundtrips"
 * import { ts } from "ts-morph"
 * console.log(detectOpaqueRoundtrips({ program: ts.createProgram([], {}), sources: [] }).length) // 0
 * ```
 * @category diagnostics
 * @since 0.0.0
 */
export const detectOpaqueRoundtrips = ({
  program,
  sources,
  relativePath = identity,
}: {
  readonly program: ts.Program;
  readonly sources: ReadonlyArray<ts.SourceFile>;
  readonly relativePath?: (file: string) => string;
}): ReadonlyArray<OpaqueRoundtripFinding> => {
  const checker = program.getTypeChecker();
  const findings = A.empty<OpaqueRoundtripFinding>();
  for (const source of sources) {
    const visit = (node: ts.Node, samples: HashSet.HashSet<string>): void => {
      let scope = samples;
      if (
        ts.isCallExpression(node) &&
        A.some(node.arguments, (argument) => /\bArbitrary\.\w+\(/.test(argument.getText(source)))
      ) {
        const collect = (argument: ts.Node): void => {
          if (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) {
            for (const parameter of argument.parameters) scope = bindingNames(parameter.name, scope);
          }
        };
        for (const argument of node.arguments) {
          collect(argument);
          if (ts.isCallExpression(argument)) for (const inner of argument.arguments) collect(inner);
        }
      }
      if (
        HashSet.size(scope) > 0 &&
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "toStrictEqual" &&
        ts.isCallExpression(node.expression.expression) &&
        ts.isIdentifier(node.expression.expression.expression) &&
        node.expression.expression.expression.text === "expect"
      ) {
        const actual = node.expression.expression.arguments[0];
        const expected = node.arguments[0];
        if (actual !== undefined && expected !== undefined && rawSample(actual, scope) !== rawSample(expected, scope)) {
          const opaque = A.sort(
            HashSet.fromIterable([
              ...opaqueNames(checker, checker.getTypeAtLocation(actual)),
              ...opaqueNames(checker, checker.getTypeAtLocation(expected)),
            ]),
            Order.String
          );
          if (A.isReadonlyArrayNonEmpty(opaque))
            findings.push(
              OpaqueRoundtripFinding.make({
                file: relativePath(source.fileName),
                line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
                opaque,
                text: Str.slice(0, 160)(Str.replace(/\s+/g, " ")(node.getText(source))),
              })
            );
        }
      }
      ts.forEachChild(node, (child) => visit(child, scope));
    };
    visit(source, HashSet.empty());
  }
  return findings;
};

const scan = Effect.fn("OpaqueRoundtrips.scan")(function* () {
  const root = yield* findRepoRoot();
  const path = yield* Path.Path;
  const tracked = yield* runGitPathList(root, ["ls-files", "-z", "--", "*.test.ts", "*.test.tsx"], {
    onSpawnFailure: failure,
    onNonZeroExit: ({ commandLine, exitCode }) => failure(`${commandLine} exited ${exitCode}`)(exitCode),
    onTruncated: O.none(),
  });
  return yield* Effect.try({
    try: () => {
      const candidates = A.filter(tracked, (file) => {
        const text = ts.sys.readFile(path.join(root, file));
        return (
          text !== undefined &&
          /effect\/(testing\/)?Arbitrary|FastCheck/.test(text) &&
          Str.includes("toStrictEqual")(text)
        );
      });
      let groups = HashMap.empty<string, ReadonlyArray<string>>();
      for (const file of candidates) {
        let dir = path.dirname(path.join(root, file));
        while (Str.startsWith(root)(dir)) {
          const config = A.findFirst(
            A.map(["tsconfig.test.json", "tsconfig.json"], (name) => path.join(dir, name)),
            ts.sys.fileExists
          );
          if (O.isSome(config)) {
            groups = HashMap.set(
              groups,
              config.value,
              A.append(O.getOrElse(HashMap.get(groups, config.value), A.empty<string>), path.join(root, file))
            );
            break;
          }
          const parent = path.dirname(dir);
          if (parent === dir) break;
          dir = parent;
        }
      }
      // ts-morph bundles standard libraries in memory rather than beside ts.sys's compiler path.
      // Feed those same libraries to the bare host so callback inference remains intact.
      const libraries = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: { target: ts.ScriptTarget.ESNext },
      });
      libraries.createSourceFile("library-probe.ts", "export {};");
      const libraryText = HashMap.fromIterable(
        A.map(
          A.filter(libraries.getProgram().compilerObject.getSourceFiles(), (source) => source.isDeclarationFile),
          (source) => Tuple.make(path.basename(source.fileName), source.text)
        )
      );
      const findings = A.empty<OpaqueRoundtripFinding>();
      for (const [config, files] of groups) {
        const parsed = ts.getParsedCommandLineOfConfigFile(
          config,
          {},
          { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined }
        );
        if (parsed === undefined) continue;
        const options = { ...parsed.options, noEmit: true };
        const host = { ...ts.createCompilerHost(options), useSourceOfProjectReferenceRedirect: () => true };
        const readSource = host.getSourceFile;
        host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
          const library = HashMap.get(libraryText, path.basename(file));
          return O.isSome(library)
            ? ts.createSourceFile(file, library.value, languageVersion)
            : readSource(file, languageVersion, onError, shouldCreateNewSourceFile);
        };
        const program = ts.createProgram({
          rootNames: A.fromIterable(files),
          options,
          host,
          ...(parsed.projectReferences === undefined ? {} : { projectReferences: parsed.projectReferences }),
        });
        const sources = A.getSomes(A.map(files, (file) => O.fromUndefinedOr(program.getSourceFile(file))));
        findings.push(
          ...detectOpaqueRoundtrips({ program, sources, relativePath: (file) => path.relative(root, file) })
        );
      }
      return { findings, candidates: candidates.length };
    },
    catch: failure("Unable to inspect Opaque roundtrip assertions"),
  });
});

const run = Effect.fn("OpaqueRoundtrips.run")(function* () {
  const { findings, candidates } = yield* scan();
  for (const site of findings)
    yield* Console.log(`${site.file}:${site.line} [${A.join(site.opaque, ", ")}] ${site.text}`);
  yield* Console.log(
    `Arbitrary-sample Opaque toStrictEqual asserts: ${findings.length} in ${HashSet.size(HashSet.fromIterable(A.map(findings, (site) => site.file)))} file(s); scanned ${candidates} candidate file(s)`
  );
  if (A.isReadonlyArrayNonEmpty(findings))
    return yield* failWithReportedExit("opaque-roundtrips: normalise generated samples before strict equality.");
});

/**
 * Reject strict equality roundtrips over raw Arbitrary Opaque samples.
 *
 * **Example** (Inspect the command name)
 * ```ts
 * import { lintOpaqueRoundtripsCommand } from "@beep/repo-cli/commands/Lint/OpaqueRoundtrips"
 * console.log(lintOpaqueRoundtripsCommand.name) // opaque-roundtrips
 * ```
 * @category cli-commands
 * @since 0.0.0
 */
export const lintOpaqueRoundtripsCommand = Command.make("opaque-roundtrips", {}, run).pipe(
  Command.withDescription("Reject prototype-sensitive strict equality roundtrips over generated Opaque samples")
);
