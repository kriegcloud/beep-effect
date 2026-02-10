/**
 * Comment contracts namespace.
 *
 * Contracts are split per operation (Get, List, Create, etc.) and each contract module
 * exports the same symbols: `Payload`, `Success`, `Failure`, `Contract`.
 *
 * @module documents-domain/entities/Comment/contracts
 * @since 1.0.0
 * @category contracts
 */
export * as Create from "./Create.contract";
export * as Delete from "./Delete.contract";
export * as Get from "./Get.contract";
export * as ListByDiscussion from "./ListByDiscussion.contract";
export * as Update from "./Update.contract";
