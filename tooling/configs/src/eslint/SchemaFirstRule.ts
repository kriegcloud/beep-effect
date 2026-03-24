import type { Rule } from "eslint";

const NON_SCHEMA_TEXT_PATTERN =
  /\bEffect\.Effect<|\bEffect\.Success<|\bLayer\.Layer<|\bAbortSignal\b|\bAbortController\b|\bUint8Array\b|\bEventJournal\.Entry\b/;

const isExportedNode = (node: { readonly parent?: unknown }): boolean => {
  let current: { readonly parent?: unknown; readonly type?: unknown } | undefined =
    node.parent !== null && typeof node.parent === "object"
      ? (node.parent as { readonly parent?: unknown; readonly type?: unknown })
      : undefined;
  while (current !== undefined) {
    if (current.type === "ExportNamedDeclaration" || current.type === "ExportDefaultDeclaration") {
      return true;
    }
    current =
      current.parent !== null && typeof current.parent === "object"
        ? (current.parent as { readonly parent?: unknown; readonly type?: unknown })
        : undefined;
  }
  return false;
};

const isFunctionLikeType = (text: string): boolean => /=>/.test(text);

const isUnsafeTypeText = (text: string): boolean => NON_SCHEMA_TEXT_PATTERN.test(text);

const isTsInterfaceDeclaration = (
  node: unknown
): node is {
  readonly type: "TSInterfaceDeclaration";
  readonly id: { readonly name: string };
  readonly extends: ReadonlyArray<unknown>;
  readonly typeParameters?: unknown;
  readonly body: { readonly body: ReadonlyArray<unknown> };
  readonly parent?: unknown;
} =>
  typeof node === "object" &&
  node !== null &&
  "type" in node &&
  (node as { readonly type?: unknown }).type === "TSInterfaceDeclaration";

const isTsTypeAliasDeclaration = (
  node: unknown
): node is {
  readonly type: "TSTypeAliasDeclaration";
  readonly id: { readonly name: string };
  readonly typeParameters?: unknown;
  readonly typeAnnotation: { readonly type: string; readonly members?: ReadonlyArray<unknown> };
  readonly parent?: unknown;
} =>
  typeof node === "object" &&
  node !== null &&
  "type" in node &&
  (node as { readonly type?: unknown }).type === "TSTypeAliasDeclaration";

const isPropertySignatureFunctionMember = (member: unknown): boolean => {
  if (typeof member !== "object" || member === null || !("type" in member)) {
    return false;
  }
  if ((member as { readonly type: string }).type !== "TSPropertySignature") {
    return false;
  }

  const typeAnnotation = (
    member as {
      readonly typeAnnotation?: {
        readonly typeAnnotation?: {
          readonly type?: string;
        };
      };
    }
  ).typeAnnotation?.typeAnnotation;

  return typeAnnotation?.type === "TSFunctionType";
};

const hasFunctionLikeMembers = (members: ReadonlyArray<unknown>): boolean =>
  members.some((member) => {
    if (typeof member !== "object" || member === null || !("type" in member)) {
      return false;
    }
    const node = member as { readonly type: string; readonly typeAnnotation?: { readonly type?: string } };
    if (
      node.type === "TSMethodSignature" ||
      node.type === "TSCallSignatureDeclaration" ||
      node.type === "TSConstructSignatureDeclaration"
    ) {
      return true;
    }
    return isPropertySignatureFunctionMember(member);
  });

const getSourceText = (context: Rule.RuleContext, node: unknown): string =>
  context.sourceCode.getText(node as Parameters<typeof context.sourceCode.getText>[0]);

/**
 * ESLint rule that nudges exported pure-data object models toward effect/Schema.
 *
 * This rule is intentionally conservative: it ignores interfaces and type
 * literals with obvious non-schema signals such as function members, Effect,
 * Layer, AbortSignal, and external runtime handle types.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const schemaFirstRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require exported pure-data object models to be schema-first",
      recommended: false,
    },
    schema: [],
    messages: {
      interfaceModel:
        "Exported interface '{{name}}' looks schema-representable. Prefer an annotated effect/Schema model instead.",
      typeLiteralModel:
        "Exported type alias '{{name}}' looks schema-representable. Prefer an annotated effect/Schema model instead.",
    },
  },
  create(context) {
    return {
      TSInterfaceDeclaration(node: unknown) {
        if (!isTsInterfaceDeclaration(node) || !isExportedNode(node)) {
          return;
        }
        if (node.extends.length > 0 || node.typeParameters !== undefined) {
          return;
        }
        if (hasFunctionLikeMembers(node.body.body)) {
          return;
        }
        const sourceText = getSourceText(context, node);
        if (isUnsafeTypeText(sourceText)) {
          return;
        }
        context.report({
          node,
          messageId: "interfaceModel",
          data: { name: node.id.name },
        });
      },
      TSTypeAliasDeclaration(node: unknown) {
        if (!isTsTypeAliasDeclaration(node) || !isExportedNode(node)) {
          return;
        }
        if (node.typeParameters !== undefined || node.typeAnnotation.type !== "TSTypeLiteral") {
          return;
        }
        if (hasFunctionLikeMembers(node.typeAnnotation.members ?? [])) {
          return;
        }
        const sourceText = getSourceText(context, node);
        if (isFunctionLikeType(sourceText) || isUnsafeTypeText(sourceText)) {
          return;
        }
        context.report({
          node,
          messageId: "typeLiteralModel",
          data: { name: node.id.name },
        });
      },
    };
  },
};

export default schemaFirstRule;
