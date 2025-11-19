/**
 * Annotation tags shared by the contract runtime. Annotations let contracts
 * carry human-readable metadata (title, domain, method) alongside behavior so
 * runtimes can log, trace, or restrict access without additional wiring.
 */
import { BS } from "@beep/schema";
import * as Context from "effect/Context";
import * as F from "effect/Function";

export class ContextAnnotationTag extends BS.StringLiteralKit(
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
).annotations({
  schemaId: Symbol.for("@beep/contract/ContextAnnotationTag"),
  identifier: "ContextAnnotationTag",
  title: "Context Annotation Tag",
  description: "One of the possible keys for Context Annotations within `@beep/contract/Contract.ts`",
}) {}

export declare namespace ContextAnnotationTag {
  export type Type = typeof ContextAnnotationTag.Type;
  export type Encoded = typeof ContextAnnotationTag.Encoded;
}

// =============================================================================
// Annotations
// =============================================================================

/**
 * Annotation describing how a contract should be labeled in diagnostics or user
 * interfaces.
 *
 * @example
 * ```ts
 * const FetchReport = Contract.make("FetchReport", { ... })
 *   .annotate(Contract.Title, "Fetch quarterly report");
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Title extends Context.Tag(ContextAnnotationTag.Enum.Title)<Title, string>() {}

/**
 * Flag indicating whether the contract implementation honors abort signals for
 * long-running operations. Effect runtimes can use this to opt-in to passing an
 * `AbortSignal` when invoking continuations.
 *
 * @example
 * ```ts
 * const StreamUpdates = Contract.make("StreamUpdates", { ... })
 *   .annotate(Contract.SupportsAbort, true);
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class SupportsAbort extends Context.Reference<SupportsAbort>()("@beep/contract/Contract/SupportsAbort", {
  defaultValue: F.constFalse,
}) {}

/**
 * Annotation describing the logical domain or bounded context for the contract.
 * Useful for grouping logs or deriving documentation sections.
 *
 * @example
 * ```ts
 * const InviteUser = Contract.make("InviteUser", { ... })
 *   .annotate(Contract.Domain, "collaboration");
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Domain extends Context.Tag(ContextAnnotationTag.Enum.Domain)<Domain, string>() {}

/**
 * Annotation identifying the method or action name exposed by the contract.
 * This typically aligns with the runtime method invoked when fulfilling
 * requests, making it easier to correlate telemetry with implementation code.
 *
 * @example
 * ```ts
 * const InviteUser = Contract.make("InviteUser", { ... })
 *   .annotate(Contract.Method, "invitations.invite");
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Method extends Context.Tag(ContextAnnotationTag.Enum.Method)<Method, string>() {}

export type ContractAnnotationTag = Title | Method | Domain | SupportsAbort;

export type ContractAnnotationCtx = Context.Context<ContractAnnotationTag>;
