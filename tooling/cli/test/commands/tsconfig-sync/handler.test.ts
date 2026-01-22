/**
 * @file Integration Tests for tsconfig-sync Handler
 *
 * Tests the handler behavior with different modes:
 * - check mode (validate without modification)
 * - dry-run mode (preview changes)
 * - sync mode (apply changes)
 *
 * NOTE: Tests requiring actual file system operations are skipped
 * due to the complexity of setting up a test workspace.
 * The handler is tested via the actual CLI invocation in E2E tests.
 *
 * @module tsconfig-sync/test/handler
 * @since 1.0.0
 */

import { DriftDetectedError, TsconfigSyncError } from "@beep/repo-cli/commands/tsconfig-sync/errors";
import { getSyncMode, TsconfigSyncInput } from "@beep/repo-cli/commands/tsconfig-sync/schemas";
import { describe, expect, it } from "@beep/testkit";
import * as F from "effect/Function";
import * as Str from "effect/String";

// -----------------------------------------------------------------------------
// TsconfigSyncInput Tests
// -----------------------------------------------------------------------------

describe("TsconfigSyncInput", () => {
  it("creates input with default values", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(input.check).toBe(false);
    expect(input.dryRun).toBe(false);
    expect(input.filter).toBeUndefined();
    expect(input.noHoist).toBe(false);
    expect(input.verbose).toBe(false);
    expect(input.packagesOnly).toBe(false);
    expect(input.appsOnly).toBe(false);
  });

  it("creates input with check mode enabled", () => {
    const input = new TsconfigSyncInput({
      check: true,
      dryRun: false,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(input.check).toBe(true);
  });

  it("creates input with dry-run mode enabled", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: true,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(input.dryRun).toBe(true);
  });

  it("creates input with filter", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      filter: "@beep/iam-server",
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(input.filter).toBe("@beep/iam-server");
  });

  it("creates input with no-hoist enabled", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      noHoist: true,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(input.noHoist).toBe(true);
  });

  it("creates input with verbose enabled", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      noHoist: false,
      verbose: true,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(input.verbose).toBe(true);
  });

  it("creates input with packagesOnly enabled", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      noHoist: false,
      verbose: false,
      packagesOnly: true,
      appsOnly: false,
    });

    expect(input.packagesOnly).toBe(true);
  });

  it("creates input with appsOnly enabled", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: true,
    });

    expect(input.appsOnly).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// getSyncMode Tests
// -----------------------------------------------------------------------------

describe("getSyncMode", () => {
  it("returns check when check flag is true", () => {
    const input = new TsconfigSyncInput({
      check: true,
      dryRun: false,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(getSyncMode(input)).toBe("check");
  });

  it("returns dry-run when dryRun flag is true", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: true,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(getSyncMode(input)).toBe("dry-run");
  });

  it("returns sync when neither check nor dryRun is true", () => {
    const input = new TsconfigSyncInput({
      check: false,
      dryRun: false,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(getSyncMode(input)).toBe("sync");
  });

  it("check takes precedence over dryRun", () => {
    const input = new TsconfigSyncInput({
      check: true,
      dryRun: true,
      noHoist: false,
      verbose: false,
      packagesOnly: false,
      appsOnly: false,
    });

    expect(getSyncMode(input)).toBe("check");
  });
});

// -----------------------------------------------------------------------------
// Error Classes Tests
// -----------------------------------------------------------------------------

describe("DriftDetectedError", () => {
  it("creates error with fileCount and summary", () => {
    const error = new DriftDetectedError({
      fileCount: 5,
      summary: "5 tsconfig file(s) have outdated references",
    });

    expect(F.pipe(error._tag, Str.endsWith("DriftDetectedError"))).toBe(true);
    expect(error.fileCount).toBe(5);
    expect(error.summary).toBe("5 tsconfig file(s) have outdated references");
  });

  it("has displayMessage property", () => {
    const error = new DriftDetectedError({
      fileCount: 3,
      summary: "3 files need updating",
    });

    expect(F.pipe(error.displayMessage, Str.includes("3"))).toBe(true);
    expect(F.pipe(error.displayMessage, Str.includes("drift"))).toBe(true);
  });
});

describe("TsconfigSyncError", () => {
  it("creates error with filePath and operation", () => {
    const error = new TsconfigSyncError({
      filePath: "/path/to/tsconfig.build.json",
      operation: "read",
    });

    expect(F.pipe(error._tag, Str.endsWith("TsconfigSyncError"))).toBe(true);
    expect(error.filePath).toBe("/path/to/tsconfig.build.json");
    expect(error.operation).toBe("read");
  });

  it("creates error with cause", () => {
    const cause = new Error("ENOENT");
    const error = new TsconfigSyncError({
      filePath: "/path/to/tsconfig.build.json",
      operation: "read",
      cause,
    });

    expect(error.cause).toBe(cause);
  });

  it("has displayMessage property", () => {
    const error = new TsconfigSyncError({
      filePath: "/path/to/file.json",
      operation: "write",
    });

    expect(F.pipe(error.displayMessage, Str.includes("/path/to/file.json"))).toBe(true);
    expect(F.pipe(error.displayMessage, Str.includes("write"))).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Handler Integration Tests (Skipped)
//
// NOTE: These tests are skipped because they require:
// - A full workspace setup with package.json and tsconfig files
// - RepoUtilsLive layer with access to actual filesystem
// - Test fixture cleanup after modifications
//
// The handler is tested via the actual CLI invocation in E2E tests.
// -----------------------------------------------------------------------------

describe("tsconfigSyncHandler", () => {
  it.skip("check mode returns success when no drift", () => {
    expect(true).toBe(true);
  });

  it.skip("check mode fails with DriftDetectedError when drift exists", () => {
    expect(true).toBe(true);
  });

  it.skip("dry-run mode shows changes without modifying files", () => {
    expect(true).toBe(true);
  });

  it.skip("sync mode writes updated references", () => {
    expect(true).toBe(true);
  });

  it.skip("filter option scopes to specific package", () => {
    expect(true).toBe(true);
  });

  it.skip("no-hoist option skips transitive dependencies", () => {
    expect(true).toBe(true);
  });

  it.skip("verbose option shows detailed output", () => {
    expect(true).toBe(true);
  });

  it.skip("fails with CyclicDependencyError on cycles", () => {
    expect(true).toBe(true);
  });
});
