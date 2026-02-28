import { getAllowlistDiagnostics, isViolationAllowlisted } from "./effect-laws-allowlist.mjs";

const ALIAS_MAP = {
  "effect/Array": "A",
  "effect/Option": "O",
  "effect/Predicate": "P",
  "effect/Record": "R",
  "effect/Schema": "S",
};

const isStableEffectSubmodule = (moduleName) =>
  moduleName.startsWith("effect/") && !moduleName.startsWith("effect/unstable/");

/**
 * @type {import("eslint").Rule.RuleModule}
 */
const effectImportStyleRule = {
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
    const cwd = process.cwd().replaceAll("\\", "/");
    const absoluteFilePath = context.filename.replaceAll("\\", "/");
    const relativeFilePath = absoluteFilePath.startsWith(`${cwd}/`) ? absoluteFilePath.slice(cwd.length + 1) : absoluteFilePath;

    const reportIfNotAllowlisted = (node, kind, messageId, data) => {
      const allowed = isViolationAllowlisted({
        ruleId: "beep-laws/effect-import-style",
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
        if (node.source.type !== "Literal" || typeof node.source.value !== "string") {
          return;
        }

        const moduleName = node.source.value;
        if (!isStableEffectSubmodule(moduleName)) {
          return;
        }

        const expectedAlias = ALIAS_MAP[moduleName];

        if (expectedAlias !== undefined) {
          const namespaceSpecifiers = node.specifiers.filter((specifier) => specifier.type === "ImportNamespaceSpecifier");
          const hasOnlyNamespace = namespaceSpecifiers.length === 1 && node.specifiers.length === 1;

          if (!hasOnlyNamespace) {
            reportIfNotAllowlisted(node, "alias-namespace-required", "aliasNamespaceRequired", {
              alias: expectedAlias,
              moduleName,
            });
            return;
          }

          const namespace = namespaceSpecifiers[0];
          const actualAlias = namespace.local.name;
          if (actualAlias !== expectedAlias) {
            reportIfNotAllowlisted(namespace.local, "alias-mismatch", "aliasMismatch", {
              expected: expectedAlias,
              actual: actualAlias,
              moduleName,
            });
          }

          return;
        }

        reportIfNotAllowlisted(node, "prefer-root-import", "preferRootImport", { moduleName });
      },
    };
  },
};

export default effectImportStyleRule;
