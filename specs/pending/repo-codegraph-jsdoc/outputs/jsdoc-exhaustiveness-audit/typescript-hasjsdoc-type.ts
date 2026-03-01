/**
 * @module TypeScriptHasJSDocType
 * @description Snapshot of TypeScript compiler `HasJSDoc` support surface for
 * audit and reference workflows.
 * @since 2026-03-01
 *
 * @source typescript.d.ts-morph (TypeScript compiler)
 * @description The HasJSDoc union type defines ALL AST node types that the TypeScript
 * compiler recognizes as being able to host JSDoc comments. This is the compiler's
 * authoritative answer to "what can have JSDoc attached to it?"
 *
 * This is critical for the knowledge graph pipeline because it defines the complete
 * set of AST nodes where JSDoc extraction should be attempted.
 */

import type * as ts from "typescript";

/**
 * TypeScript compiler's authoritative union of AST node types that can host JSDoc.
 *
 * This alias intentionally tracks the compiler-provided definition so the
 * snapshot remains semantically correct across TypeScript upgrades.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export type HasJSDoc = ts.HasJSDoc;
