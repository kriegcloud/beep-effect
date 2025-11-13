import { BS } from "@beep/schema";
import * as Context from "effect/Context";
import * as F from "effect/Function";

export const ContextAnnotationTagKit = BS.stringLiteralKit(
  "@beep/contract/Contract/Title",
  "@beep/contract/Contract/Domain",
  "@beep/contract/Contract/Method",
  "@beep/contract/Contract/SupportsAbort",
  {
    enumMapping: [
      ["@beep/contract/Contract/SupportsAbort", "SupportsAbort"],
      ["@beep/contract/Contract/Title", "Title"],
      ["@beep/contract/Contract/Domain", "Domain"],
      ["@beep/contract/Contract/Method", "Method"],
    ],
  }
);

export class ContextAnnotationTag extends ContextAnnotationTagKit.Schema.annotations({
  schemaId: Symbol.for("@beep/contract/ContextAnnotationTag"),
  identifier: "ContextAnnotationTag",
  title: "Context Annotation Tag",
  description: "One of the possible keys for Context Annotations within `@beep/contract/Contract.ts`",
}) {
  static readonly Options = ContextAnnotationTagKit.Options;
  static readonly Enum = ContextAnnotationTagKit.Enum;
}

export declare namespace ContextAnnotationTag {
  export type Type = typeof ContextAnnotationTag.Type;
  export type Encoded = typeof ContextAnnotationTag.Encoded;
}

// =============================================================================
// Annotations
// =============================================================================

/**
 * Annotation for providing a human-readable title for contracts.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 *
 * const myContract = Contract.make("start_password_reset")
 *   .annotate(Contract.Title, "Start Password Reset")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Title extends Context.Tag(ContextAnnotationTag.Enum.Title)<Title, string>() {}

/**
 * Annotation indicating whether a tool only reads data without making changes.
 *
 * @example
 * ```ts
 * import { Tool } from "@effect/ai"
 *
 * const readOnlyTool = Tool.make("get_user_info")
 *   .annotate(Tool.Readonly, true)
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class SupportsAbort extends Context.Reference<SupportsAbort>()("@beep/contract/Contract/SupportsAbort", {
  defaultValue: F.constFalse,
}) {}

/**
 * Annotation for providing a human-readable title for contracts.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 *
 * const myContract = Contract.make("start_password_reset")
 *   .annotate(Contract.Domain, "Organizations")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Domain extends Context.Tag(ContextAnnotationTag.Enum.Domain)<Domain, string>() {}

/**
 * Annotation for providing a human-readable title for contracts.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 *
 * const myContract = Contract.make("start_password_reset")
 *   .annotate(Contract.Method, "signIn")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Method extends Context.Tag(ContextAnnotationTag.Enum.Method)<Method, string>() {}

export type ContractAnnotationTag = Title | Method | Domain | SupportsAbort;

export type ContractAnnotationCtx = Context.Context<ContractAnnotationTag>;
