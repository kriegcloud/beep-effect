import { BS } from "@beep/schema";
import { getAt } from "@beep/utils";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FingerPrint } from "./internal";
import { normalize } from "./normalize";
import type { Rule } from "./Rule";
import type { RuleGroup } from "./RuleGroup";
import type { RuleSet } from "./RuleSet";
import {
  ArrayLengthRule,
  ArrayValueRule,
  BooleanRule,
  DateRule,
  HasEntryRule,
  HasKeyRule,
  HasValueRule,
  NumberRule,
  StringRule,
  TypeRule,
} from "./rules";
import type { RuleSetOrGroup } from "./types";
import { validate } from "./validate";
export type Runner = (value: unknown) => boolean;

type CacheEntry = { runner: Runner; fp: string };
const cache = new WeakMap<RuleSet.Type, CacheEntry>();

// Explicit cache invalidation (belt & suspenders for callers that mutate trees)
export function invalidatePrepared(root: RuleSet.Type): void {
  cache.delete(root);
}

function compileRule(rule: Rule.Type): Runner {
  // Pre-resolve a fast field accessor (direct key access)
  const get = (obj: Record<string, any>) => getAt(obj, rule.field);

  return Match.value(rule).pipe(
    Match.withReturnType<((v: any) => boolean) | boolean>(),
    Match.discriminators("type")({
      string: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Str.isString(resolved) ? StringRule.validate(r, resolved) : false,
        ),
      number: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Num.isNumber(resolved) ? NumberRule.validate(r, resolved) : false,
        ),
      boolean: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          Bool.isBoolean(resolved) ? BooleanRule.validate(r, resolved) : false,
        ),
      arrayValue: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          S.is(S.Union(BS.NonEmptyJsonArray, BS.JsonArray, BS.Json))
            ? ArrayValueRule.validate(r, resolved)
            : false,
        ),
      arrayLength: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          A.isArray(resolved) ? ArrayLengthRule.validate(r, resolved) : false,
        ),
      hasKey: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          S.is(
            S.Record({
              key: S.String,
              value: BS.Json,
            }),
          )
            ? HasKeyRule.validate(r, resolved)
            : false,
        ),
      hasValue: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          S.is(
            S.Record({
              key: S.String,
              value: BS.Json,
            }),
          )
            ? HasValueRule.validate(r, resolved)
            : false,
        ),
      hasEntry: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          S.is(
            S.Record({
              key: S.String,
              value: BS.Json,
            }),
          )
            ? HasEntryRule.validate(r, resolved)
            : false,
        ),
      typeRule: (r) => (v: any) =>
        F.pipe(get(v), (resolved) => TypeRule.validate(r, resolved)),
      date: (r) => (v: any) =>
        F.pipe(get(v), (resolved) => DateRule.validate(r, resolved)),
    }),
    Match.orElse(() => F.constant(false)),
  );
}

function compileGroup(u: RuleSetOrGroup): Runner {
  const children = u.rules.map((child) =>
    child.node === "group" ? compileGroup(child) : compileRule(child),
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

export function prepare(root: RuleSet.Type): Runner {
  const cached = cache.get(root);
  const currentFp = FingerPrint.make(root);
  if (cached && cached.fp === currentFp) return cached.runner;

  const v = validate(root);
  if (!v.isValid) {
    throw new Error(v.reason);
  }

  // Normalize once for predictable structure; mutates in place.
  normalize(root);

  const runner = compileGroup(root);
  const entry: CacheEntry = { runner, fp: FingerPrint.make(root) };
  cache.set(root, entry);
  return entry.runner;
}

export function runPrepared(root: RuleSet.Type, value: unknown): boolean {
  return prepare(root)(value);
}

// Internal export for in-package use (e.g., run.ts) to compile groups without
// validation or caching. Not re-exported from index.ts to keep public API clean.
export function createRunner(u: RuleGroup.Type | RuleSet.Type): Runner {
  return compileGroup(u);
}
