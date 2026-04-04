/**
 * Schema-first approvals configuration models for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw approvals config surface into
 * repo-native Effect schemas while preserving the documented wire shape and
 * optional-field semantics.
 *
 * Runtime defaults such as disabled forwarding and `"session"` mode remain
 * documented here but are not injected during schema decoding.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { ApprovalsConfig } from "@beep/clawhole/config/Approvals"
 *
 * const approvals = S.decodeUnknownSync(ApprovalsConfig)({
 *   exec: {
 *     enabled: true,
 *     mode: "targets",
 *     targets: [
 *       {
 *         channel: "slack",
 *         to: "C123"
 *       }
 *     ]
 *   }
 * })
 *
 * console.log(O.isSome(approvals.exec)) // true
 * console.log(O.isNone(approvals.plugin)) // true
 * ```
 *
 * @module @beep/clawhole/config/Approvals
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { ArrayOfStrings, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("config/Approvals");

const strictParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const NativeExecApprovalEnableModeAuto = S.Literal("auto").pipe(
  $I.annoteSchema("NativeExecApprovalEnableModeAuto", {
    description: "Automatic enablement mode for native exec approvals when approvers can be resolved implicitly.",
  })
);

const ExecApprovalForwardTargetChannel = S.NonEmptyString.pipe(
  $I.annoteSchema("ExecApprovalForwardTargetChannel", {
    description: "A non-empty approval-delivery channel identifier such as `discord`, `slack`, or a plugin channel id.",
  })
);

const ExecApprovalForwardTargetDestination = S.NonEmptyString.pipe(
  $I.annoteSchema("ExecApprovalForwardTargetDestination", {
    description: "A non-empty destination identifier within a delivery channel, such as a user id or channel id.",
  })
);

const ExecApprovalForwardTargetThreadId = S.Union([S.String, S.Number]).pipe(
  $I.annoteSchema("ExecApprovalForwardTargetThreadId", {
    description:
      "Optional thread identifier for nested approval delivery destinations, expressed as either a string or number.",
  })
);

/**
 * Enable mode for native exec-approval delivery integrations.
 *
 * `true` enables native approvals, `false` disables them, and `"auto"` lets
 * the runtime enable native approvals when approvers can be resolved
 * implicitly.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const NativeExecApprovalEnableMode = S.Union([S.Boolean, NativeExecApprovalEnableModeAuto]).pipe(
  $I.annoteSchema("NativeExecApprovalEnableMode", {
    description:
      'Enable mode for native exec-approval integrations: `true`, `false`, or `"auto"` for runtime auto-enable behavior.',
  })
);

/**
 * Type of {@link NativeExecApprovalEnableMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type NativeExecApprovalEnableMode = typeof NativeExecApprovalEnableMode.Type;

/**
 * Forwarding modes for exec and plugin approval prompts.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ExecApprovalForwardingMode = LiteralKit(["session", "targets", "both"] as const).pipe(
  $I.annoteSchema("ExecApprovalForwardingMode", {
    description:
      "Forwarding modes for approval prompts: origin session only, configured targets only, or both delivery paths.",
  })
);

/**
 * Type of {@link ExecApprovalForwardingMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ExecApprovalForwardingMode = typeof ExecApprovalForwardingMode.Type;

/**
 * Explicit delivery target for forwarded exec or plugin approvals.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ExecApprovalForwardTarget extends S.Class<ExecApprovalForwardTarget>($I`ExecApprovalForwardTarget`)(
  {
    channel: ExecApprovalForwardTargetChannel.annotateKey({
      description:
        "Channel id used to deliver forwarded approval prompts, such as `discord`, `slack`, or a plugin channel id.",
    }),
    to: ExecApprovalForwardTargetDestination.annotateKey({
      description: "Destination id within the selected delivery channel, such as a channel id or user id.",
    }),
    accountId: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional account id used by multi-account delivery channels.",
    }),
    threadId: S.OptionFromOptionalKey(ExecApprovalForwardTargetThreadId).annotateKey({
      description: "Optional thread id used to reply inside an existing delivery thread.",
    }),
  },
  $I.annote("ExecApprovalForwardTarget", {
    description: "Explicit delivery target for forwarded exec or plugin approvals.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * Forwarding policy for exec or plugin approval prompts.
 *
 * All properties remain optional at decode time. Upstream OpenClaw applies
 * runtime defaults when values are absent:
 * - `enabled`: `false`
 * - `mode`: `"session"`
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ExecApprovalForwardingConfig extends S.Class<ExecApprovalForwardingConfig>(
  $I`ExecApprovalForwardingConfig`
)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether approval forwarding is enabled for this approval surface. Runtime default: `false`.",
    }),
    mode: S.OptionFromOptionalKey(ExecApprovalForwardingMode).annotateKey({
      description:
        'Delivery mode for forwarded approvals: origin session, configured targets, or both. Runtime default: `"session"`.',
    }),
    agentFilter: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Optional allowlist of agent ids whose approvals may be forwarded.",
    }),
    sessionFilter: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Optional list of session-key substring or regex filters used to limit forwarding.",
    }),
    targets: ExecApprovalForwardTarget.pipe(S.Array, S.OptionFromOptionalKey).annotateKey({
      description: "Explicit delivery targets used when the forwarding mode includes configured targets.",
    }),
  },
  $I.annote("ExecApprovalForwardingConfig", {
    description: "Forwarding policy for exec or plugin approval prompts.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * Top-level approvals configuration for exec and plugin approval forwarding.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ApprovalsConfig extends S.Class<ApprovalsConfig>($I`ApprovalsConfig`)(
  {
    exec: S.OptionFromOptionalKey(ExecApprovalForwardingConfig).annotateKey({
      description: "Forwarding configuration for exec approval prompts.",
    }),
    plugin: S.OptionFromOptionalKey(ExecApprovalForwardingConfig).annotateKey({
      description: "Forwarding configuration for plugin approval prompts.",
    }),
  },
  $I.annote("ApprovalsConfig", {
    description: "Top-level approvals configuration for exec and plugin approval forwarding.",
    parseOptions: strictParseOptions,
  })
) {}
