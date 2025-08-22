import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { fingerprint } from "./internal/fingerprint";
import { normalize } from "./normalize";
import type { RootGroup, RuleGroup } from "./ruleGroup";
import * as Rules from "./rules";
import { isPlainObject } from "./utils/is-plain-object";
import { validate } from "./validate";
export type Runner = (value: unknown) => boolean;

type CacheEntry = { runner: Runner; fp: string };
const cache = new WeakMap<RootGroup.Type, CacheEntry>();

function compileRule(rule: Rules.Rule.Type): Runner {
  // Pre-resolve a fast field accessor (direct key access)
  const get = (obj: Record<string, any>) =>
    R.get(rule.field)(obj).pipe(O.getOrThrow);

  return Match.value(rule).pipe(
    Match.withReturnType<((v: any) => boolean) | boolean>(),
    Match.tags({
      string: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Str.isString(resolved)
            ? Rules.StringRule.validate(r, resolved)
            : false,
        ),
      number: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Num.isNumber(resolved)
            ? Rules.NumberRule.validate(r, resolved)
            : false,
        ),
      boolean: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Bool.isBoolean(resolved)
            ? Rules.BooleanRule.validate(r, resolved)
            : false,
        ),
      arrayValue: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          A.isArray(resolved)
            ? Rules.ArrayValueRule.validate(r, resolved)
            : false,
        ),
      arrayLength: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          A.isArray(resolved)
            ? Rules.ArrayLengthRule.validate(r, resolved)
            : false,
        ),
      hasKey: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          isPlainObject(resolved)
            ? Rules.HasKeyRule.validate(r, resolved)
            : false,
        ),
      hasValue: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          isPlainObject(resolved)
            ? Rules.HasValueRule.validate(r, resolved)
            : false,
        ),
      hasEntry: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          isPlainObject(resolved)
            ? Rules.HasEntryRule.validate(r, resolved)
            : false,
        ),
      genericComparison: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Rules.GenericComparisonRule.validate(r, resolved),
        ),
      genericType: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Rules.GenericTypeRule.validate(r, resolved),
        ),
      date: (r) => (v: any) =>
        F.pipe(get(v), (resolved) => Rules.DateRule.validate(r, resolved)),
    }),
    Match.orElse(() => F.constFalse),
  );
}

function compileGroup(u: RuleGroup.Type | RootGroup.Type): Runner {
  const children: Runner[] = u.rules.map((child) =>
    child.entity === "group"
      ? compileGroup(child)
      : compileRule(child as Rules.Rule.Type),
  );

  if (children.length === 0) {
    return () => true;
  }

  if (u.logicalOp === "and") {
    return (v: any) => {
      for (let i = 0; i < children.length; i++) {
        if (!children[i]?.(v)) return false;
      }
      return true;
    };
  }

  // logicalOp === "or"
  return (v: any) => {
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
