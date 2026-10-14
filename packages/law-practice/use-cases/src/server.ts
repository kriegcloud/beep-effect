/**
 * Server-only law-practice use-case exports (product service contracts).
 *
 * @packageDocumentation
 * @category services
 * @since 0.0.0
 */

/** Document identification schemas, ports and pure pipeline. @category services @since 0.0.0 */
export * as DocumentIdentification from "./DocumentIdentification/index.ts";
/**
 * IR-to-law mapping service contract exports.
 *
 * **Example** (Verify IrToLaw factory export)
 *
 * ```ts
 * import * as IrToLaw from "@beep/law-practice-use-cases/IrToLaw"
 *
 * console.log(Object.keys(IrToLaw).includes("makeIrToLaw")) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as IrToLaw from "./IrToLaw/index.ts";
/**
 * Mail-tagging ports, pure matter tagger, tagging job, attachment filer, and
 * undo exports.
 *
 * **Example** (Verify the tagger export)
 *
 * ```ts
 * import * as MailTagging from "@beep/law-practice-use-cases/MailTagging"
 *
 * console.log(Object.keys(MailTagging).includes("decideMatterTagging")) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as MailTagging from "./MailTagging/index.ts";
/**
 * Office-action review loop service contract exports.
 *
 * **Example** (Verify review factory export)
 *
 * ```ts
 * import * as OfficeActionReview from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * console.log(Object.keys(OfficeActionReview).includes("makeOfficeActionReview")) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as OfficeActionReview from "./OfficeActionReview/index.ts";
/** Atomic office-action evidence exports. @category services @since 0.0.0 */
export * as OfficeActionStructure from "./OfficeActionStructure/index.ts";
/**
 * Typed patent-claim candidate mapping exports.
 *
 * @category mapping
 * @since 0.0.0
 */
export * from "./PatentClaimCandidate/index.ts";
/**
 * Practice knowledge-graph MCP declaration exports.
 *
 * **Example** (Count practice KG tools)
 *
 * ```ts
 * import { PracticeKgToolkit } from "@beep/law-practice-use-cases/server"
 *
 * console.log(Object.keys(PracticeKgToolkit.tools).length) // 11
 * ```
 *
 * @category tools
 * @since 0.0.0
 */
export * from "./PracticeKg.correspondent-lookup.ts";
export * from "./PracticeKg.matter-lookup.ts";
export * from "./PracticeKg.tools.ts";
/**
 * Attorney review queue: typed errors, the verdict-log port and the queue
 * contract.
 *
 * **Example** (Reference the review queue service)
 *
 * ```ts
 * import { ReviewQueue } from "@beep/law-practice-use-cases/server"
 *
 * console.log(ReviewQueue.ReviewQueue.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as ReviewQueue from "./ReviewQueue/index.ts";
/**
 * Canonical toolkit composers.
 *
 * @category tools
 * @since 0.0.0
 */
export * from "./Tools.ts";
/**
 * Verdict projector: claim-disposition projection values and the pure
 * projector contract.
 *
 * **Example** (Read the projector's confirm reason)
 *
 * ```ts
 * import { VerdictProjector } from "@beep/law-practice-use-cases/server"
 *
 * console.log(VerdictProjector.ATTORNEY_CONFIRMED_REASON) // "Attorney confirmed the finding"
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as VerdictProjector from "./VerdictProjector/index.ts";
