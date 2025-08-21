import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { normalize } from "./normalize";
import * as Rules from "./rules";
import type { RootUnion, Union } from "./union";
import { isObject } from "./utils/is-object";
import { validate } from "./validate";
export type Runner = (value: unknown) => boolean;

type CacheEntry = { runner: Runner; fp: string };
const cache = new WeakMap<RootUnion.Type, CacheEntry>();

function fingerprint(u: Union.Type | RootUnion.Type): string {
  const parts: string[] = [];
  const walk = (node: Union.Type | RootUnion.Type): void => {
    parts.push(`U:${node.id}:${node.logicalOp}`);
    for (let i = 0; i < node.rules.length; i++) {
      const child = O.fromNullable(node.rules[i]).pipe(O.getOrThrow);
      if (child.entity === "union") {
        walk(child);
      } else {
        const tag = child._tag ?? "";
        const id = child.id ?? "";
        const field = child.field ?? "";
        parts.push(`R:${tag}:${id}:${field}:${child._tag}`);
      }
    }
  };
  walk(u);
  return parts.join("|");
}

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
      objectKey: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          isObject(resolved)
            ? Rules.ObjectKeyRule.validate(r, resolved)
            : false,
        ),
      objectValue: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          isObject(resolved)
            ? Rules.ObjectValueRule.validate(r, resolved)
            : false,
        ),
      objectKeyValue: (r) => (v: any) =>
        F.pipe(get(v), (resolved) =>
          isObject(resolved)
            ? Rules.ObjectKeyValueRule.validate(r, resolved)
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

function compileUnion(u: Union.Type | RootUnion.Type): Runner {
  const children: Runner[] = u.rules.map((child) =>
    child.entity === "union"
      ? compileUnion(child)
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

export function prepare(root: RootUnion.Type): Runner {
  const cached = cache.get(root);
  const currentFp = fingerprint(root);
  if (cached && cached.fp === currentFp) return cached.runner;

  const v = validate(root);
  if (!v.isValid) {
    throw new Error(v.reason);
  }

  // Normalize once for predictable structure; mutates in place.
  normalize(root);

  const runner = compileUnion(root);
  const entry: CacheEntry = { runner, fp: fingerprint(root) };
  cache.set(root, entry);
  return entry.runner;
}

export function runPrepared(root: RootUnion.Type, value: unknown): boolean {
  return prepare(root)(value);
}

// Internal export for in-package use (e.g., run.ts) to compile unions without
// validation or caching. Not re-exported from index.ts to keep public API clean.
export function createRunner(u: Union.Type | RootUnion.Type): Runner {
  return compileUnion(u);
}
