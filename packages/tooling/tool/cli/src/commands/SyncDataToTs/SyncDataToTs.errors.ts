/**
 * Tagged errors for the SyncDataToTs command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/SyncDataToTs/SyncDataToTs.errors"); /**
 * Operational error during source fetch, parsing, projection, or file writes.
 *
 * @category utilities
 * @since 0.0.0
 */
export class SyncDataToTsError extends TaggedErrorClass<SyncDataToTsError>($I`SyncDataToTsError`)(
  "SyncDataToTsError",
  {
    message: S.String,
    targetId: S.optionalKey(S.String),
    file: S.optionalKey(S.String),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("SyncDataToTsError", {
    title: "Sync Data To TypeScript Error",
    description: "Failed to fetch, decode, normalize, render, or write synced data.",
  })
) {}

/**
 * Drift detected in check mode.
 *
 * @category utilities
 * @since 0.0.0
 */
export class SyncDataToTsDriftError extends TaggedErrorClass<SyncDataToTsDriftError>($I`SyncDataToTsDriftError`)(
  "SyncDataToTsDriftError",
  {
    message: S.String,
    driftCount: S.Number,
  },
  $I.annote("SyncDataToTsDriftError", {
    title: "Sync Data To TypeScript Drift Error",
    description: "Generated data drift was detected while running in check mode.",
  })
) {}
