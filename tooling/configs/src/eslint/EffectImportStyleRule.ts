import { Struct, thunkSome, thunkSomeNone, thunkUndefined } from "@beep/utils";
import { Effect, SchemaGetter as G, HashMap, HashSet, pipe, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Rule } from "eslint";
import {
  decodeImportDeclarationNode,
  decodeImportNamespaceSpecifierNode,
  decodeImportSpecifierNode,
  resolveImportSpecifierImportKind,
} from "../internal/eslint/RuleAstSchemas.ts";
import { resolveRelativeRuleFilePath } from "../internal/eslint/RulePathing.ts";
import { createAllowlistViolationReporter, reportAllowlistDiagnostics } from "../internal/eslint/RuleReporting.ts";
import {
  makeRuleViolationPayload,
  type RuleViolation,
  RuleViolationPayload,
  toRuleViolation,
} from "../internal/eslint/RuleViolation.ts";

const STABLE_EFFECT_SUBMODULE_PATTERN = /^effect\/(?!unstable\/).+/;

const StableEffectSubmodule = S.String.check(S.isPattern(STABLE_EFFECT_SUBMODULE_PATTERN));
const isStableEffectSubmodule = S.is(StableEffectSubmodule);

class EffectImportAlias extends S.Class<EffectImportAlias>("EffectImportAlias")({
  moduleName: S.String,
  alias: S.String,
}) {}

const effectImportAliasEntries = A.make(
  new EffectImportAlias({ moduleName: "effect/Array", alias: "A" }),
  new EffectImportAlias({ moduleName: "effect/Option", alias: "O" }),
  new EffectImportAlias({ moduleName: "effect/Predicate", alias: "P" }),
  new EffectImportAlias({ moduleName: "effect/Record", alias: "R" }),
  new EffectImportAlias({ moduleName: "effect/Schema", alias: "S" }),
  new EffectImportAlias({ moduleName: "effect/String", alias: "Str" }),
  new EffectImportAlias({ moduleName: "effect/Equal", alias: "Eq" }),
  new EffectImportAlias({ moduleName: "effect/Boolean", alias: "Bool" })
);

const effectImportAliasMap = HashMap.fromIterable(
  pipe(
    effectImportAliasEntries,
    A.map((entry): readonly [string, string] => [entry.moduleName, entry.alias])
  )
);

const FUNCTION_MODULE_NAME = "effect/Function";

const ROOT_EFFECT_FUNCTION_EXPORTS = HashSet.fromIterable(["absurd", "cast", "flow", "hole", "identity", "pipe"]);

class EffectImportObservation extends S.Class<EffectImportObservation>("EffectImportObservation")({
  moduleName: S.String,
  namespaceAlias: S.Option(S.String).pipe(S.withConstructorDefault(thunkSomeNone<string>)),
  namedValueImports: S.Array(S.String),
  hasOnlyNamespaceSpecifier: S.Boolean,
  isTypeOnly: S.Boolean,
}) {}

const decodeImportObservation = (node: unknown): O.Option<EffectImportObservation> =>
  pipe(
    decodeImportDeclarationNode(node),
    O.map((importDeclaration) => {
      const namespaceSpecifiers = pipe(
        importDeclaration.specifiers,
        A.map((specifier) => decodeImportNamespaceSpecifierNode(specifier)),
        A.getSomes
      );
      const namespaceAlias = pipe(namespaceSpecifiers, A.head, O.map(Struct.dotGet("local.name")));
      const namedValueImports = pipe(
        importDeclaration.specifiers,
        A.map((specifier) => {
          const importKind = resolveImportSpecifierImportKind(specifier, importDeclaration.importKind);
          return pipe(
            decodeImportSpecifierNode(specifier),
            O.filter(() => importKind !== "type"),
            O.map((importSpecifier) => importSpecifier.imported.name)
          );
        }),
        A.getSomes
      );

      return new EffectImportObservation({
        moduleName: importDeclaration.source.value,
        namespaceAlias,
        namedValueImports,
        hasOnlyNamespaceSpecifier: A.length(namespaceSpecifiers) === 1 && A.length(importDeclaration.specifiers) === 1,
        isTypeOnly: importDeclaration.importKind === "type",
      });
    })
  );

const toAliasNamespaceRequiredViolation = (moduleName: string, alias: string): RuleViolationPayload =>
  makeRuleViolationPayload("alias-namespace-required", "aliasNamespaceRequired", {
    alias,
    moduleName,
  });

const toAliasMismatchViolation = (
  moduleName: string,
  expectedAlias: string,
  actualAlias: string
): RuleViolationPayload =>
  makeRuleViolationPayload("alias-mismatch", "aliasMismatch", {
    expected: expectedAlias,
    actual: actualAlias,
    moduleName,
  });

const toPreferRootImportViolation = (moduleName: string): RuleViolationPayload =>
  makeRuleViolationPayload("prefer-root-import", "preferRootImport", {
    moduleName,
  });

const shouldAllowFunctionSubmoduleNamedImport = (observation: EffectImportObservation): boolean =>
  observation.moduleName === FUNCTION_MODULE_NAME &&
  A.some(observation.namedValueImports, (importName) => !HashSet.has(ROOT_EFFECT_FUNCTION_EXPORTS, importName));

const resolvePreferRootImportViolation = (observation: EffectImportObservation): O.Option<RuleViolationPayload> =>
  shouldAllowFunctionSubmoduleNamedImport(observation)
    ? O.none()
    : O.some(toPreferRootImportViolation(observation.moduleName));

const ImportViolationPayloadOption = S.Option(RuleViolationPayload);
const ImportAliasMapAndObservation = S.Tuple([S.HashMap(S.String, S.String), EffectImportObservation]);

type ImportAliasMapAndObservation = typeof ImportAliasMapAndObservation.Type;
type ImportViolationPayloadOption = typeof ImportViolationPayloadOption.Type;

const ImportAliasMapAndObservationToViolation = ImportAliasMapAndObservation.pipe(
  S.decodeTo(ImportViolationPayloadOption, {
    decode: G.transformOrFail(([aliasMap, observation]: ImportAliasMapAndObservation) =>
      Effect.succeed(
        pipe(
          HashMap.get(aliasMap, observation.moduleName),
          O.match({
            onNone: () => resolvePreferRootImportViolation(observation),
            onSome: (expectedAlias) =>
              pipe(
                observation.namespaceAlias,
                O.match({
                  onNone: thunkSome(toAliasNamespaceRequiredViolation(observation.moduleName, expectedAlias)),
                  onSome: (actualAlias) =>
                    pipe(
                      O.liftPredicate((value: boolean) => !value)(observation.hasOnlyNamespaceSpecifier),
                      O.map(() => toAliasNamespaceRequiredViolation(observation.moduleName, expectedAlias)),
                      O.orElse(() =>
                        pipe(
                          O.liftPredicate((alias: string) => alias !== expectedAlias)(actualAlias),
                          O.map((alias) => toAliasMismatchViolation(observation.moduleName, expectedAlias, alias))
                        )
                      )
                    ),
                })
              ),
          })
        )
      )
    ),
    encode: G.transformOrFail((value: ImportViolationPayloadOption) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(value), {
          message: "Encoding unknown values is not supported by ImportAliasMapAndObservationToViolation.",
        })
      )
    ),
  })
);

const decodeAliasObservationViolation = S.decodeUnknownOption(ImportAliasMapAndObservationToViolation);

const resolveViolation = (observation: EffectImportObservation): O.Option<RuleViolation> =>
  pipe(decodeAliasObservationViolation([effectImportAliasMap, observation]), O.flatten, O.map(toRuleViolation));

const resolveRootImportAliasViolations = (node: unknown): ReadonlyArray<RuleViolation> =>
  pipe(
    decodeImportDeclarationNode(node),
    O.filter(
      (importDeclaration) => importDeclaration.source.value === "effect" && importDeclaration.importKind !== "type"
    ),
    O.map((importDeclaration) =>
      pipe(
        importDeclaration.specifiers,
        A.map((specifier) => {
          const importKind = resolveImportSpecifierImportKind(specifier, importDeclaration.importKind);
          return pipe(
            decodeImportSpecifierNode(specifier),
            O.filter(() => importKind !== "type"),
            O.map((importSpecifier) => {
              const moduleName = `effect/${importSpecifier.imported.name}`;
              return pipe(
                HashMap.get(effectImportAliasMap, moduleName),
                O.filter((expectedAlias) => importSpecifier.local.name === expectedAlias),
                O.map((expectedAlias) => toRuleViolation(toAliasNamespaceRequiredViolation(moduleName, expectedAlias)))
              );
            }),
            O.flatten
          );
        }),
        A.getSomes
      )
    ),
    O.getOrElse(A.empty<RuleViolation>)
  );

/**
 * Custom ESLint rule that enforces Effect import laws:
 * - canonical aliases for A/O/P/R/S and helper namespace submodule imports
 * - root `effect` imports for stable modules outside the alias map
 *
 * @category Configuration
 * @since 0.0.0
 */
export const effectImportStyleRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce compact Effect import style (canonical namespace aliases and root imports for other stable modules)",
      recommended: false,
    },
    schema: [],
    messages: {
      allowlistInvalid: "Effect laws allowlist is invalid: {{detail}}",
      aliasNamespaceRequired:
        'Use namespace import with alias {{alias}} for {{moduleName}} (for example: import * as {{alias}} from "{{moduleName}}";).',
      aliasMismatch: "Use alias {{expected}} for {{moduleName}} instead of {{actual}}.",
      preferRootImport:
        'Prefer root imports from "effect" for stable modules. Replace {{moduleName}} with named import from "effect".',
    },
  },
  create(context) {
    const relativeFilePath = resolveRelativeRuleFilePath(context.filename);
    const reportViolationIfNeeded = createAllowlistViolationReporter({
      context,
      ruleId: "beep-laws/effect-import-style",
      relativeFilePath,
    });

    return {
      Program() {
        reportAllowlistDiagnostics(context);
      },
      ImportDeclaration(node) {
        pipe(
          decodeImportObservation(node),
          O.filter((observation) => isStableEffectSubmodule(observation.moduleName) && !observation.isTypeOnly),
          O.flatMap(resolveViolation),
          O.match({
            onNone: thunkUndefined,
            onSome: reportViolationIfNeeded(node),
          })
        );

        for (const violation of resolveRootImportAliasViolations(node)) {
          reportViolationIfNeeded(violation, node);
        }
      },
    };
  },
};

export default effectImportStyleRule;
