/**
 * Tagged errors for the Laws command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Laws/Laws.errors");
export class DualArityInventoryReadError extends TaggedErrorClass<DualArityInventoryReadError>(
  $I`DualArityInventoryReadError`
)(
  "DualArityInventoryReadError",
  {
    message: S.String,
  },
  $I.annote("DualArityInventoryReadError", {
    description: "Raised when the committed dual-arity inventory cannot be parsed or decoded.",
  })
) {}

export class EffectImportRulesPersistenceError extends TaggedErrorClass<EffectImportRulesPersistenceError>(
  $I`EffectImportRulesPersistenceError`
)(
  "EffectImportRulesPersistenceError",
  {
    message: S.String,
  },
  $I.annote("EffectImportRulesPersistenceError", {
    description: "Effect import rules could not be persisted to disk.",
  })
) {}

export class NoNativeRuntimeRulesExecutionError extends TaggedErrorClass<NoNativeRuntimeRulesExecutionError>(
  $I`NoNativeRuntimeRulesExecutionError`
)(
  "NoNativeRuntimeRulesExecutionError",
  {
    message: S.String,
  },
  $I.annote("NoNativeRuntimeRulesExecutionError", {
    description: "Repo-local native runtime checks failed unexpectedly.",
  })
) {}

export class TerseEffectRulesPersistenceError extends TaggedErrorClass<TerseEffectRulesPersistenceError>(
  $I`TerseEffectRulesPersistenceError`
)(
  "TerseEffectRulesPersistenceError",
  {
    message: S.String,
  },
  $I.annote("TerseEffectRulesPersistenceError", {
    description: "Terse Effect rule updates could not be persisted to disk.",
  })
) {}
