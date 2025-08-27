import { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { RuleSetOrGroup } from "../types";
import type { AnyOperator } from "./Operands";

export namespace FingerPrint {
  const fingerprintOperator = (
    op: AnyOperator.Type,
  ): string | readonly unknown[] => {
    const toMs = (x: unknown): number | null => {
      const d = new Date(x as any);
      const t = d.getTime();
      return Number.isFinite(t) ? t : null;
    };

    switch (op._tag) {
      case "eq":
      case "ne":
      case "gt":
      case "gte":
      case "lt":
      case "lte":
      case "startsWith":
      case "endsWith":
      case "contains":
      case "notContains":
      case "inSet":
      case "oneOf":
      case "allOf":
      case "noneOf":
      case "isSameHour":
      case "isSameDay":
      case "isSameWeek":
      case "isSameMonth":
      case "isSameYear": {
        if (P.hasProperty("value")(op)) {
          if (P.hasProperty("ignoreCase")(op)) {
            return [op._tag, op.value, op.ignoreCase];
          }
          return [op._tag, op.value];
        }

        console.error("Unknown equality operand: ", op);
        return [op._tag];
      }
      case "matches": {
        if (
          P.hasProperty("value")(op) &&
          P.and(P.hasProperty("source"), P.hasProperty("flags"))(op.value)
        ) {
          return [op._tag, op.value.source, op.value.flags] as const;
        }
        console.error("Unknown matches operand: ", op);
        // Serialize regex deterministically
        return [op._tag];
      }
      case "between": {
        if (
          P.and(P.hasProperty("value"), P.hasProperty("inclusive"))(op) &&
          P.and(P.hasProperty("min"), P.hasProperty("max"))(op.value)
        ) {
          const min = toMs(op.value.min);
          const max = toMs(op.value.max);

          return [op._tag, min, max, !!op.inclusive] as const;
        }
        console.error("Unknown between operand: ", op);
        return [op._tag];
      }
      case "isTrue":
      case "isFalse":
      case "isString":
      case "isNumber":
      case "isTruthy":
      case "isFalsy":
      case "isNull":
      case "isUndefined":
      case "isBoolean":
      case "isArray":
      case "isObject": {
        return [op._tag];
      }
      // Config-less operators

      default: {
        const _exhaustive: never = op;
        console.error("Unknown Operand: ", op);
        return _exhaustive;
      }
    }
  };

  /**
   * Computes a structural fingerprint of a group root to detect changes.
   * Includes logical ops, and full rule payloads that affect evaluation.
   * Excludes volatile rule ids (id, parentId). Serializes RegExp deterministically.
   */
  export const make = (u: RuleSetOrGroup): string => {
    const parts: Array<string> = [];
    const walk = (node: RuleSetOrGroup): void => {
      parts.push(`U:${node.logicalOp}`);
      for (let i = 0; i < node.rules.length; i++) {
        const child = O.fromNullable(node.rules[i]).pipe(O.getOrThrow);
        if (child.node === "group") {
          walk(child);
        } else {
          const payload = JSON.stringify(child, (k, v) => {
            if (k === "id" || k === "parentId") return undefined;
            if (k === "op") return fingerprintOperator(v);
            if (S.is(BS.Regex)(v)) return `re:/${v.source}/${v.flags}`;
            return v;
          });
          parts.push(`R:${payload}`);
        }
      }
    };
    walk(u);
    return parts.join("|");
  };
}
