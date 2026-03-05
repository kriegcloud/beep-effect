import { Struct, thunkSome, thunkSomeNone, thunkUndefined } from "@beep/utils";
import { Effect, SchemaGetter as G, HashMap, pipe, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Rule } from "eslint";
import { decodeImportDeclarationNode, decodeImportNamespaceSpecifierNode } from "../internal/eslint/RuleAstSchemas.ts";
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
  new EffectImportAlias({ moduleName: "effect/Schema", alias: "S" })
);

const effectImportAliasMap = HashMap.fromIterable(
  pipe(
    effectImportAliasEntries,
    A.map((entry): readonly [string, string] => [entry.moduleName, entry.alias])
  )
);

class EffectImportObservation extends S.Class<EffectImportObservation>("EffectImportObservation")({
  moduleName: S.String,
  namespaceAlias: S.Option(S.String).pipe(S.withConstructorDefault(thunkSomeNone<string>)),
  hasOnlyNamespaceSpecifier: S.Boolean,
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

      return new EffectImportObservation({
        moduleName: importDeclaration.source.value,
        namespaceAlias,
        hasOnlyNamespaceSpecifier: A.length(namespaceSpecifiers) === 1 && A.length(importDeclaration.specifiers) === 1,
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

const EffectImportViolationPayloadOption = S.Option(RuleViolationPayload);
const EffectImportAliasMapAndObservation = S.Tuple([S.HashMap(S.String, S.String), EffectImportObservation]);

type EffectImportAliasMapAndObservation = (typeof EffectImportAliasMapAndObservation)["Type"];
type EffectImportViolationPayloadOption = (typeof EffectImportViolationPayloadOption)["Type"];

const EffectImportAliasMapAndObservationToViolation = EffectImportAliasMapAndObservation.pipe(
  S.decodeTo(EffectImportViolationPayloadOption, {
    decode: G.transformOrFail(([aliasMap, observation]: EffectImportAliasMapAndObservation) =>
      Effect.succeed(
        pipe(
          HashMap.get(aliasMap, observation.moduleName),
          O.match({
            onNone: thunkSome(toPreferRootImportViolation(observation.moduleName)),
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
    encode: G.transformOrFail((value: EffectImportViolationPayloadOption) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(value), {
          message: "Encoding unknown values is not supported by EffectImportAliasMapAndObservationToViolation.",
        })
      )
    ),
  })
);

const decodeAliasObservationViolation = S.decodeUnknownOption(EffectImportAliasMapAndObservationToViolation);

const resolveViolation = (observation: EffectImportObservation): O.Option<RuleViolation> =>
  pipe(decodeAliasObservationViolation([effectImportAliasMap, observation]), O.flatten, O.map(toRuleViolation));

/**
 * Custom ESLint rule that enforces Effect import laws:
 * - canonical aliases for A/O/P/R/S submodule imports
 * - root `effect` imports for stable modules outside the alias map
 *
 * @since 0.0.0
 * @category Configuration
 */
export const effectImportStyleRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce compact Effect import style (A/O/P/R/S aliases and root imports for other stable modules)",
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
          O.filter((observation) => isStableEffectSubmodule(observation.moduleName)),
          O.flatMap(resolveViolation),
          O.match({
            onNone: thunkUndefined,
            onSome: reportViolationIfNeeded(node),
          })
        );
      },
    };
  },
};

export default effectImportStyleRule;
