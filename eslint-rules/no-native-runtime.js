import { HashSet } from "effect";
import * as Str from "effect/String";
import { getAllowlistDiagnostics, isViolationAllowlisted } from "./effect-laws-allowlist.js";

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
const HOTSPOT_RUNTIME_PATTERNS = [
  /^packages\/ai\/sdk\/src\/core\/AgentSdkConfig\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/SessionConfig\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/Diagnose\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/Storage\/SessionIndexStore\.ts$/,
  /^tooling\/cli\/src\/commands\/DocsAggregate\.ts$/,
  /^tooling\/cli\/src\/commands\/Lint\/index\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/index\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/EffectImports\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyConfig\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyServices\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyRuntime\.ts$/,
  /^\.claude\/hooks\/schemas\/index\.ts$/,
  /^\.claude\/hooks\/skill-suggester\/index\.ts$/,
  /^\.claude\/hooks\/subagent-init\/index\.ts$/,
  /^\.claude\/hooks\/agent-init\/index\.ts$/,
  /^\.claude\/hooks\/pattern-detector\/core\.ts$/,
];
const NODE_RUNTIME_IMPORTS = HashSet.fromIterable(["node:fs", "node:path", "node:child_process"]);
const STRING_METHODS = HashSet.fromIterable(["split", "trim", "startsWith", "endsWith"]);

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
      nodeRuntimeImport:
        "Avoid {{moduleName}} runtime imports in hotspot runtime code. Use Effect FileSystem/Path/process services.",
      nativeFetch:
        "Avoid native fetch in hotspot runtime code. Use effect/unstable/http HttpClient and runtime client layers.",
      nativeSort: "Avoid native .sort in hotspot runtime code. Use A.sort with an explicit Order.",
      stringMethod:
        "Avoid native string method .{{method}} in hotspot runtime code. Prefer effect/String and shared schema transforms.",
    },
  },
  create(context) {
    const cwd = process.cwd().replaceAll("\\", "/");
    const absoluteFilePath = context.filename.replaceAll("\\", "/");
    const relativeFilePath = absoluteFilePath.startsWith(`${cwd}/`)
      ? Str.slice(cwd.length + 1)(absoluteFilePath)
      : absoluteFilePath;
    const inHotspotScope = HOTSPOT_RUNTIME_PATTERNS.some((pattern) => pattern.test(relativeFilePath));

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
      ImportDeclaration(node) {
        if (!inHotspotScope) return;
        const sourceValue = node.source.value;
        if (typeof sourceValue !== "string") return;
        if (!HashSet.has(NODE_RUNTIME_IMPORTS, sourceValue)) return;
        reportIfNotAllowlisted(node, "node-runtime-import", "nodeRuntimeImport", { moduleName: sourceValue });
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
        if (inHotspotScope && callee.type === "Identifier" && callee.name === "fetch") {
          reportIfNotAllowlisted(node, "native-fetch", "nativeFetch");
          return;
        }
        if (
          inHotspotScope &&
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.object.type === "Identifier" &&
          callee.object.name === "globalThis" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "fetch"
        ) {
          reportIfNotAllowlisted(node, "native-fetch", "nativeFetch");
          return;
        }
        if (
          callee.type !== "MemberExpression" ||
          callee.computed ||
          callee.object.type !== "Identifier" ||
          callee.property.type !== "Identifier"
        ) {
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
          return;
        }

        if (inHotspotScope && propertyName === "sort" && objectName !== "A") {
          reportIfNotAllowlisted(node, "native-sort", "nativeSort");
          return;
        }

        if (inHotspotScope && HashSet.has(STRING_METHODS, propertyName) && objectName !== "Str") {
          reportIfNotAllowlisted(node, "string-method", "stringMethod", { method: propertyName });
        }
      },
      BinaryExpression(node) {
        const isEqualityOp =
          node.operator === "===" || node.operator === "==" || node.operator === "!==" || node.operator === "!=";
        if (!isEqualityOp) return;

        const leftTypeof = node.left.type === "UnaryExpression" && node.left.operator === "typeof";
        const rightTypeof = node.right.type === "UnaryExpression" && node.right.operator === "typeof";

        const leftString =
          node.left.type === "Literal" &&
          typeof node.left.value === "string" &&
          HashSet.has(TYPEOF_TYPES, node.left.value);
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
