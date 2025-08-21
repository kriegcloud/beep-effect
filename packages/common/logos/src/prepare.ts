import * as O from "effect/Option";
import * as R from "effect/Record";
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

  switch (rule._tag) {
    case "string": {
      return (v: any) => {
        const resolved = get(v);
        if (typeof resolved === "string") {
          return Rules.StringRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "number": {
      return (v: any) => {
        const resolved = get(v);
        if (typeof resolved === "number") {
          return Rules.NumberRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "boolean": {
      return (v: any) => {
        const resolved = get(v);
        if (typeof resolved === "boolean") {
          return Rules.BooleanRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "arrayValue": {
      return (v: any) => {
        const resolved = get(v);
        if (Array.isArray(resolved)) {
          return Rules.ArrayValueRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "arrayLength": {
      return (v: any) => {
        const resolved = get(v);
        if (Array.isArray(resolved)) {
          return Rules.ArrayLengthRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "objectKey": {
      return (v: any) => {
        const resolved = get(v);
        if (isObject(resolved)) {
          return Rules.ObjectKeyRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "objectValue": {
      return (v: any) => {
        const resolved = get(v);
        if (isObject(resolved)) {
          return Rules.ObjectValueRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "objectKeyValue": {
      return (v: any) => {
        const resolved = get(v);
        if (isObject(resolved)) {
          return Rules.ObjectKeyValueRule.validate(rule, resolved);
        }
        return false;
      };
    }
    case "genericComparison": {
      return (v: any) => {
        const resolved = get(v);
        return Rules.GenericComparisonRule.validate(rule, resolved);
      };
    }
    case "genericType": {
      return (v: any) => {
        const resolved = get(v);
        return Rules.GenericTypeRule.validate(rule, resolved);
      };
    }
    case "date": {
      return (v: any) => {
        const resolved = get(v);
        return Rules.DateRule.validate(rule, resolved);
      };
    }
    default: {
      return () => false;
    }
  }
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
