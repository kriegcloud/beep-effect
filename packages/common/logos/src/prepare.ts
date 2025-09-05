import type { UnsafeTypes } from "@beep/types";
import { getAt } from "@beep/utils";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { RootGroup, RuleGroup } from "./groups";
import { fingerprint } from "./internal/fingerprint";
import { normalize } from "./normalize";
import * as Rules from "./rules";
import { validate } from "./validate";
export type Runner = (value: unknown) => boolean;

type CacheEntry = { runner: Runner; fp: string };
const cache = new WeakMap<RootGroup.Type, CacheEntry>();

// Explicit cache invalidation (belt & suspenders for callers that mutate trees)
export function invalidatePrepared(root: RootGroup.Type): void {
  cache.delete(root);
}

function compileRule(rule: Rules.Rule.Type): Runner {
  // Pre-resolve a fast field accessor (direct key access)
  const get = (obj: Record<string, UnsafeTypes.UnsafeAny>) => getAt(obj, rule.field);

  return Match.value(rule).pipe(
    Match.withReturnType<((v: UnsafeTypes.UnsafeAny) => boolean) | boolean>(),
    Match.discriminators("type")({
      string: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (Str.isString(resolved) ? Rules.StringRule.validate(r, resolved) : false)),
      number: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (Num.isNumber(resolved) ? Rules.NumberRule.validate(r, resolved) : false)),
      boolean: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (Bool.isBoolean(resolved) ? Rules.BooleanRule.validate(r, resolved) : false)),
      arrayValue: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (A.isArray(resolved) ? Rules.ArrayValueRule.validate(r, resolved) : false)),
      arrayLength: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (A.isArray(resolved) ? Rules.ArrayLengthRule.validate(r, resolved) : false)),
      hasKey: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (P.isRecord(resolved) ? Rules.HasKeyRule.validate(r, resolved) : false)),
      hasValue: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (P.isRecord(resolved) ? Rules.HasValueRule.validate(r, resolved) : false)),
      hasEntry: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => (P.isRecord(resolved) ? Rules.HasEntryRule.validate(r, resolved) : false)),
      genericComparison: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => Rules.GenericComparisonRule.validate(r, resolved)),
      genericType: (r) => (v: UnsafeTypes.UnsafeAny) =>
        F.pipe(get(v), (resolved) => Rules.GenericTypeRule.validate(r, resolved)),
      date: (r) => (v: UnsafeTypes.UnsafeAny) => F.pipe(get(v), (resolved) => Rules.DateRule.validate(r, resolved)),
    }),
    Match.orElse(() => F.constant(false))
  );
}

function compileGroup(u: RuleGroup.Type | RootGroup.Type): Runner {
  const children: Runner[] = u.rules.map((child) =>
    child.node === "group" ? compileGroup(child) : compileRule(child as Rules.Rule.Type)
  );

  if (children.length === 0) {
    return () => true;
  }

  if (u.logicalOp === "and") {
    return (v: UnsafeTypes.UnsafeAny) => {
      for (let i = 0; i < children.length; i++) {
        if (!children[i]?.(v)) return false;
      }
      return true;
    };
  }

  // logicalOp === "or"
  return (v: UnsafeTypes.UnsafeAny) => {
    for (let i = 0; i < children.length; i++) {
      if (children[i]?.(v)) return true;
    }
    return false;
  };
}

export function prepare(root: RootGroup.Type): Runner {
  const cached = cache.get(root);
  const currentFp = fingerprint(root);
  if (cached && cached.fp === currentFp) return cached.runner;

  const v = validate(root);
  if (!v.isValid) {
    throw new Error(v.reason);
  }

  // Normalize once for predictable structure; mutates in place.
  normalize(root);

  const runner = compileGroup(root);
  const entry: CacheEntry = { runner, fp: fingerprint(root) };
  cache.set(root, entry);
  return entry.runner;
}

export function runPrepared(root: RootGroup.Type, value: unknown): boolean {
  return prepare(root)(value);
}

// Internal export for in-package use (e.g., run.ts) to compile groups without
// validation or caching. Not re-exported from index.ts to keep public API clean.
export function createRunner(u: RuleGroup.Type | RootGroup.Type): Runner {
  return compileGroup(u);
}
