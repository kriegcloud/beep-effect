import { getAllowlistDiagnostics, isViolationAllowlisted } from "./effect-laws-allowlist.js";
import { HashSet } from "effect";
import * as Str from "effect/String";


const OBJECT_METHODS = HashSet.fromIterable([
  "keys",
  "values",
  "entries",
  "fromEntries",
  "assign",
  "hasOwn",
  "freeze",
  "seal",
  "create",
]);
const DATE_METHODS = HashSet.fromIterable(["now", "parse", "UTC"]);
const ARRAY_STATIC_METHODS = HashSet.fromIterable(["from", "isArray", "of"]);
const TYPEOF_TYPES = HashSet.fromIterable([
  "string",
  "number",
  "boolean",
  "object",
  "function",
  "undefined",
  "symbol",
  "bigint",
]);
const MAP_SET_CTORS = HashSet.fromIterable(["Map", "Set", "WeakMap", "WeakSet"]);

/**
 * @type {import("eslint").Rule.RuleModule}
 */
const noNativeRuntimeRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow native Object/Map/Set/Date runtime APIs and runtime typeof checks in domain logic",
      recommended: false,
    },
    schema: [],
    messages: {
      allowlistInvalid: "Effect laws allowlist is invalid: {{detail}}",
      objectMethod: "Avoid Object.{{method}} in domain logic. Use Effect modules or add an allowlist entry.",
      mapSetCtor: "Avoid new {{ctor}} in domain logic. Use Effect HashMap/HashSet variants or add an allowlist entry.",
      newDate: "Avoid new Date() in domain logic. Use Effect DateTime/Clock or add an allowlist entry.",
      dateStatic: "Avoid Date.{{method}} in domain logic. Use Effect DateTime/Clock or add an allowlist entry.",
      arrayStatic: "Avoid Array.{{method}} in domain logic. Use effect/Array helpers or add an allowlist entry.",
      typeofRuntime: "Avoid runtime typeof checks. Use effect/Predicate guards (for example P.isString).",
    },
  },
  create(context) {
    const cwd = process.cwd().replaceAll("\\", "/");
    const absoluteFilePath = context.filename.replaceAll("\\", "/");
    const relativeFilePath = absoluteFilePath.startsWith(`${cwd}/`) ? Str.slice(cwd.length + 1)(absoluteFilePath) : absoluteFilePath;

    const reportIfNotAllowlisted = (node, kind, messageId, data) => {
      const allowed = isViolationAllowlisted({
        ruleId: "beep-laws/no-native-runtime",
        filePath: relativeFilePath,
        kind,
      });

      if (!allowed) {
        context.report({ node, messageId, data });
      }
    };

    return {
      Program(node) {
        const diagnostics = getAllowlistDiagnostics();
        for (const detail of diagnostics) {
          context.report({ node, messageId: "allowlistInvalid", data: { detail } });
        }
      },
      NewExpression(node) {
        if (node.callee.type === "Identifier" && HashSet.has(MAP_SET_CTORS, node.callee.name)) {
          reportIfNotAllowlisted(node, "new-map-set", "mapSetCtor", { ctor: node.callee.name });
          return;
        }

        if (node.callee.type === "Identifier" && node.callee.name === "Date") {
          reportIfNotAllowlisted(node, "new-date", "newDate");
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression" || callee.computed || callee.object.type !== "Identifier" || callee.property.type !== "Identifier") {
          return;
        }

        const objectName = callee.object.name;
        const propertyName = callee.property.name;

        if (objectName === "Object" && HashSet.has(OBJECT_METHODS, propertyName)) {
          reportIfNotAllowlisted(node, "object-method", "objectMethod", { method: propertyName });
          return;
        }

        if (objectName === "Date" && HashSet.has(DATE_METHODS, propertyName)) {
          reportIfNotAllowlisted(node, "date-static", "dateStatic", { method: propertyName });
          return;
        }

        if (objectName === "Array" && HashSet.has(ARRAY_STATIC_METHODS, propertyName)) {
          reportIfNotAllowlisted(node, "array-static", "arrayStatic", { method: propertyName });
        }
      },
      BinaryExpression(node) {
        const isEqualityOp = node.operator === "===" || node.operator === "==" || node.operator === "!==" || node.operator === "!=";
        if (!isEqualityOp) return;

        const leftTypeof = node.left.type === "UnaryExpression" && node.left.operator === "typeof";
        const rightTypeof = node.right.type === "UnaryExpression" && node.right.operator === "typeof";

        const leftString =
          node.left.type === "Literal" && typeof node.left.value === "string" && HashSet.has(TYPEOF_TYPES, node.left.value);
        const rightString =
          node.right.type === "Literal" &&
          typeof node.right.value === "string" &&
          HashSet.has(TYPEOF_TYPES, node.right.value);

        if ((leftTypeof && rightString) || (rightTypeof && leftString)) {
          reportIfNotAllowlisted(node, "typeof-runtime", "typeofRuntime");
        }
      },
    };
  },
};

export default noNativeRuntimeRule;
