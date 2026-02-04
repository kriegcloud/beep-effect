/**
 * @file Unit tests for context-freshness command schemas and helpers.
 * @module context-freshness.test
 */

import {
  CriticalStalenessError,
  DirectoryNotFoundError,
  FreshnessCheckError,
  GitCommandError,
} from "@beep/repo-cli/commands/context-freshness/errors";
import {
  DEFAULT_THRESHOLDS,
  FreshnessCheckInput,
  FreshnessItem,
  FreshnessReport,
  type FreshnessStatus,
  FreshnessSummary,
  type ItemCategory,
} from "@beep/repo-cli/commands/context-freshness/schemas";
import { describe, effect, expect, it, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Schema Validation Tests
// -----------------------------------------------------------------------------

describe("context-freshness schemas", () => {
  describe("FreshnessCheckInput", () => {
    it("decodes valid input with all fields", () => {
      const input = {
        thresholdWarningDays: 14,
        thresholdCriticalDays: 30,
        format: "json",
      };

      const result = S.decodeUnknownEither(FreshnessCheckInput)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.thresholdWarningDays, 14);
        strictEqual(result.right.thresholdCriticalDays, 30);
        strictEqual(result.right.format, "json");
      }
    });

    it("decodes input with table format", () => {
      const input = {
        thresholdWarningDays: 30,
        thresholdCriticalDays: 60,
        format: "table",
      };

      const result = S.decodeUnknownEither(FreshnessCheckInput)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.format, "table");
      }
    });

    it("applies default values for missing optional fields", () => {
      const input = {};

      const result = S.decodeUnknownEither(FreshnessCheckInput)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.thresholdWarningDays, 30);
        strictEqual(result.right.thresholdCriticalDays, 60);
        strictEqual(result.right.format, "table");
      }
    });

    it("applies partial defaults", () => {
      const input = {
        format: "json",
      };

      const result = S.decodeUnknownEither(FreshnessCheckInput)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.thresholdWarningDays, 30);
        strictEqual(result.right.thresholdCriticalDays, 60);
        strictEqual(result.right.format, "json");
      }
    });

    it("fails on invalid format value", () => {
      const input = {
        format: "xml",
      };

      const result = S.decodeUnknownEither(FreshnessCheckInput)(input);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("fails on non-numeric threshold values", () => {
      const input = {
        thresholdWarningDays: "thirty",
        thresholdCriticalDays: 60,
        format: "table",
      };

      const result = S.decodeUnknownEither(FreshnessCheckInput)(input);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("FreshnessItem", () => {
    it("decodes valid freshness item", () => {
      const input = {
        path: ".repos/effect",
        category: "effect-repo",
        lastModified: "2025-01-15T10:00:00.000Z",
        ageInDays: 15,
        status: "fresh",
      };

      const result = S.decodeUnknownEither(FreshnessItem)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.path, ".repos/effect");
        strictEqual(result.right.category, "effect-repo");
        strictEqual(result.right.status, "fresh");
      }
    });

    it("decodes context category item", () => {
      const input = {
        path: "context/effect",
        category: "context",
        lastModified: "2025-01-01T00:00:00.000Z",
        ageInDays: 35,
        status: "warning",
      };

      const result = S.decodeUnknownEither(FreshnessItem)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.category, "context");
        strictEqual(result.right.status, "warning");
      }
    });

    it("decodes skill category item", () => {
      const input = {
        path: ".claude/skills/discovery-kit/SKILL.md",
        category: "skill",
        lastModified: "2024-11-01T00:00:00.000Z",
        ageInDays: 95,
        status: "critical",
      };

      const result = S.decodeUnknownEither(FreshnessItem)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.category, "skill");
        strictEqual(result.right.status, "critical");
      }
    });

    it("fails on invalid category", () => {
      const input = {
        path: "/some/path",
        category: "unknown-category",
        lastModified: "2025-01-15T10:00:00.000Z",
        ageInDays: 15,
        status: "fresh",
      };

      const result = S.decodeUnknownEither(FreshnessItem)(input);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("fails on invalid status", () => {
      const input = {
        path: "/some/path",
        category: "context",
        lastModified: "2025-01-15T10:00:00.000Z",
        ageInDays: 15,
        status: "unknown-status",
      };

      const result = S.decodeUnknownEither(FreshnessItem)(input);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("FreshnessSummary", () => {
    it("decodes valid summary", () => {
      const input = {
        fresh: 5,
        warning: 2,
        critical: 1,
      };

      const result = S.decodeUnknownEither(FreshnessSummary)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.fresh, 5);
        strictEqual(result.right.warning, 2);
        strictEqual(result.right.critical, 1);
      }
    });

    it("decodes zero values", () => {
      const input = {
        fresh: 0,
        warning: 0,
        critical: 0,
      };

      const result = S.decodeUnknownEither(FreshnessSummary)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("fails on missing field", () => {
      const input = {
        fresh: 5,
        warning: 2,
        // missing critical
      };

      const result = S.decodeUnknownEither(FreshnessSummary)(input);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("FreshnessReport", () => {
    it("decodes valid report", () => {
      const input = {
        scannedAt: "2025-02-01T12:00:00.000Z",
        summary: { fresh: 3, warning: 1, critical: 0 },
        items: [
          {
            path: ".repos/effect",
            category: "effect-repo",
            lastModified: "2025-01-25T10:00:00.000Z",
            ageInDays: 7,
            status: "fresh",
          },
          {
            path: "context/effect",
            category: "context",
            lastModified: "2025-01-20T10:00:00.000Z",
            ageInDays: 12,
            status: "fresh",
          },
        ],
        hasCritical: false,
      };

      const result = S.decodeUnknownEither(FreshnessReport)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.scannedAt, "2025-02-01T12:00:00.000Z");
        strictEqual(result.right.hasCritical, false);
        strictEqual(A.length(result.right.items), 2);
      }
    });

    it("decodes report with empty items", () => {
      const input = {
        scannedAt: "2025-02-01T12:00:00.000Z",
        summary: { fresh: 0, warning: 0, critical: 0 },
        items: [],
        hasCritical: false,
      };

      const result = S.decodeUnknownEither(FreshnessReport)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes report with critical items", () => {
      const input = {
        scannedAt: "2025-02-01T12:00:00.000Z",
        summary: { fresh: 1, warning: 1, critical: 2 },
        items: [
          {
            path: ".repos/effect",
            category: "effect-repo",
            lastModified: "2024-10-01T10:00:00.000Z",
            ageInDays: 123,
            status: "critical",
          },
        ],
        hasCritical: true,
      };

      const result = S.decodeUnknownEither(FreshnessReport)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        strictEqual(result.right.hasCritical, true);
      }
    });
  });
});

// -----------------------------------------------------------------------------
// Default Thresholds Tests
// -----------------------------------------------------------------------------

describe("DEFAULT_THRESHOLDS", () => {
  it("has correct thresholds for effect-repo", () => {
    const thresholds = DEFAULT_THRESHOLDS["effect-repo"];
    strictEqual(thresholds.warning, 30);
    strictEqual(thresholds.critical, 60);
  });

  it("has correct thresholds for context", () => {
    const thresholds = DEFAULT_THRESHOLDS.context;
    strictEqual(thresholds.warning, 30);
    strictEqual(thresholds.critical, 45);
  });

  it("has correct thresholds for skill", () => {
    const thresholds = DEFAULT_THRESHOLDS.skill;
    strictEqual(thresholds.warning, 60);
    strictEqual(thresholds.critical, 90);
  });

  it("has all three categories defined", () => {
    const categories = Object.keys(DEFAULT_THRESHOLDS);
    strictEqual(A.length(categories), 3);
    expect(categories).toContain("effect-repo");
    expect(categories).toContain("context");
    expect(categories).toContain("skill");
  });
});

// -----------------------------------------------------------------------------
// Error Tests
// -----------------------------------------------------------------------------

describe("context-freshness errors", () => {
  describe("DirectoryNotFoundError", () => {
    it("creates with path and message", () => {
      const error = new DirectoryNotFoundError({
        path: ".repos/effect",
        message: "Directory not found: .repos/effect",
      });

      strictEqual(error._tag, "DirectoryNotFoundError");
      strictEqual(error.path, ".repos/effect");
      strictEqual(error.message, "Directory not found: .repos/effect");
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new DirectoryNotFoundError({
            path: "/test/path",
            message: "Not found",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("DirectoryNotFoundError", (e) => Effect.succeed(`Caught: ${e.path}`))
        );

        strictEqual(result, "Caught: /test/path");
      })
    );
  });

  describe("FreshnessCheckError", () => {
    it("creates with message only", () => {
      const error = new FreshnessCheckError({
        message: "Check failed",
      });

      strictEqual(error._tag, "FreshnessCheckError");
      strictEqual(error.message, "Check failed");
      expect(error.cause).toBeUndefined();
    });

    it("creates with message and cause", () => {
      const error = new FreshnessCheckError({
        message: "Check failed",
        cause: "Underlying error",
      });

      strictEqual(error._tag, "FreshnessCheckError");
      strictEqual(error.cause, "Underlying error");
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new FreshnessCheckError({
            message: "Test failure",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("FreshnessCheckError", (e) => Effect.succeed(`Caught: ${e.message}`))
        );

        strictEqual(result, "Caught: Test failure");
      })
    );
  });

  describe("GitCommandError", () => {
    it("creates with command and message", () => {
      const error = new GitCommandError({
        command: "git log -1 --format=%ci",
        message: "Git command failed",
      });

      strictEqual(error._tag, "GitCommandError");
      strictEqual(error.command, "git log -1 --format=%ci");
      strictEqual(error.message, "Git command failed");
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new GitCommandError({
            command: "git status",
            message: "Not a git repository",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("GitCommandError", (e) => Effect.succeed(`Caught: ${e.command}`))
        );

        strictEqual(result, "Caught: git status");
      })
    );
  });

  describe("CriticalStalenessError", () => {
    it("creates with message and count", () => {
      const error = new CriticalStalenessError({
        message: "Critical staleness detected",
        criticalCount: 3,
      });

      strictEqual(error._tag, "CriticalStalenessError");
      strictEqual(error.message, "Critical staleness detected");
      strictEqual(error.criticalCount, 3);
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new CriticalStalenessError({
            message: "Stale",
            criticalCount: 5,
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("CriticalStalenessError", (e) => Effect.succeed(`Caught: ${e.criticalCount} critical`))
        );

        strictEqual(result, "Caught: 5 critical");
      })
    );
  });

  describe("error union matching", () => {
    it("can match all error types exhaustively", () => {
      type ContextFreshnessError =
        | DirectoryNotFoundError
        | FreshnessCheckError
        | GitCommandError
        | CriticalStalenessError;

      const errors: ReadonlyArray<ContextFreshnessError> = [
        new DirectoryNotFoundError({ path: "/path", message: "not found" }),
        new FreshnessCheckError({ message: "check failed" }),
        new GitCommandError({ command: "git", message: "failed" }),
        new CriticalStalenessError({ message: "stale", criticalCount: 1 }),
      ];

      const tags = A.map(errors, (error) =>
        Match.value(error).pipe(
          Match.tag("DirectoryNotFoundError", () => "directory"),
          Match.tag("FreshnessCheckError", () => "check"),
          Match.tag("GitCommandError", () => "git"),
          Match.tag("CriticalStalenessError", () => "critical"),
          Match.exhaustive
        )
      );

      strictEqual(tags[0], "directory");
      strictEqual(tags[1], "check");
      strictEqual(tags[2], "git");
      strictEqual(tags[3], "critical");
    });
  });
});

// -----------------------------------------------------------------------------
// Helper Function Tests (Status Determination Logic)
// -----------------------------------------------------------------------------

describe("status determination logic", () => {
  /**
   * Helper to determine status based on age and category thresholds.
   * This mirrors the logic in handler.ts for testing purposes.
   */
  const determineStatus = (ageInDays: number, category: ItemCategory): FreshnessStatus => {
    const thresholds = DEFAULT_THRESHOLDS[category];
    if (ageInDays >= thresholds.critical) {
      return "critical";
    }
    if (ageInDays >= thresholds.warning) {
      return "warning";
    }
    return "fresh";
  };

  describe("effect-repo category", () => {
    it("returns fresh when age is below warning threshold", () => {
      strictEqual(determineStatus(0, "effect-repo"), "fresh");
      strictEqual(determineStatus(15, "effect-repo"), "fresh");
      strictEqual(determineStatus(29, "effect-repo"), "fresh");
    });

    it("returns warning when age is at or above warning threshold but below critical", () => {
      strictEqual(determineStatus(30, "effect-repo"), "warning");
      strictEqual(determineStatus(45, "effect-repo"), "warning");
      strictEqual(determineStatus(59, "effect-repo"), "warning");
    });

    it("returns critical when age is at or above critical threshold", () => {
      strictEqual(determineStatus(60, "effect-repo"), "critical");
      strictEqual(determineStatus(90, "effect-repo"), "critical");
      strictEqual(determineStatus(365, "effect-repo"), "critical");
    });
  });

  describe("context category", () => {
    it("returns fresh when age is below warning threshold", () => {
      strictEqual(determineStatus(0, "context"), "fresh");
      strictEqual(determineStatus(15, "context"), "fresh");
      strictEqual(determineStatus(29, "context"), "fresh");
    });

    it("returns warning when age is at or above warning threshold but below critical", () => {
      strictEqual(determineStatus(30, "context"), "warning");
      strictEqual(determineStatus(35, "context"), "warning");
      strictEqual(determineStatus(44, "context"), "warning");
    });

    it("returns critical when age is at or above critical threshold", () => {
      strictEqual(determineStatus(45, "context"), "critical");
      strictEqual(determineStatus(60, "context"), "critical");
      strictEqual(determineStatus(365, "context"), "critical");
    });
  });

  describe("skill category", () => {
    it("returns fresh when age is below warning threshold", () => {
      strictEqual(determineStatus(0, "skill"), "fresh");
      strictEqual(determineStatus(30, "skill"), "fresh");
      strictEqual(determineStatus(59, "skill"), "fresh");
    });

    it("returns warning when age is at or above warning threshold but below critical", () => {
      strictEqual(determineStatus(60, "skill"), "warning");
      strictEqual(determineStatus(75, "skill"), "warning");
      strictEqual(determineStatus(89, "skill"), "warning");
    });

    it("returns critical when age is at or above critical threshold", () => {
      strictEqual(determineStatus(90, "skill"), "critical");
      strictEqual(determineStatus(120, "skill"), "critical");
      strictEqual(determineStatus(365, "skill"), "critical");
    });
  });
});

// -----------------------------------------------------------------------------
// Age Calculation Tests
// -----------------------------------------------------------------------------

describe("age calculation logic", () => {
  /**
   * Calculate age in days from a timestamp relative to now.
   * This mirrors the logic in handler.ts for testing purposes.
   */
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const calculateAgeInDays = (timestampMs: number, nowMs: number): number => {
    const diff = nowMs - timestampMs;
    return Math.floor(diff / MS_PER_DAY);
  };

  // Use fixed timestamp for deterministic tests (2025-02-01T12:00:00.000Z)
  const FIXED_NOW_MS = 1738411200000;

  it("calculates zero days for same timestamp", () => {
    strictEqual(calculateAgeInDays(FIXED_NOW_MS, FIXED_NOW_MS), 0);
  });

  it("calculates one day for 24 hours difference", () => {
    const oneDayAgo = FIXED_NOW_MS - MS_PER_DAY;
    strictEqual(calculateAgeInDays(oneDayAgo, FIXED_NOW_MS), 1);
  });

  it("calculates 30 days correctly", () => {
    const thirtyDaysAgo = FIXED_NOW_MS - 30 * MS_PER_DAY;
    strictEqual(calculateAgeInDays(thirtyDaysAgo, FIXED_NOW_MS), 30);
  });

  it("floors partial days", () => {
    const almostTwoDays = FIXED_NOW_MS - 1.9 * MS_PER_DAY;
    strictEqual(calculateAgeInDays(almostTwoDays, FIXED_NOW_MS), 1);
  });

  it("handles future timestamps as negative days", () => {
    const tomorrow = FIXED_NOW_MS + MS_PER_DAY;
    strictEqual(calculateAgeInDays(tomorrow, FIXED_NOW_MS), -1);
  });
});

// -----------------------------------------------------------------------------
// JSON Report Format Tests
// -----------------------------------------------------------------------------

describe("JSON report format", () => {
  it("produces valid JSON structure for FreshnessReport", () => {
    const report: S.Schema.Type<typeof FreshnessReport> = {
      scannedAt: "2025-02-01T12:00:00.000Z",
      summary: { fresh: 2, warning: 1, critical: 0 },
      items: [
        {
          path: ".repos/effect",
          category: "effect-repo",
          lastModified: "2025-01-25T10:00:00.000Z",
          ageInDays: 7,
          status: "fresh",
        },
        {
          path: "context/effect",
          category: "context",
          lastModified: "2025-01-10T10:00:00.000Z",
          ageInDays: 22,
          status: "fresh",
        },
        {
          path: ".claude/skills/test/SKILL.md",
          category: "skill",
          lastModified: "2024-12-15T10:00:00.000Z",
          ageInDays: 48,
          status: "warning",
        },
      ],
      hasCritical: false,
    };

    const jsonString = JSON.stringify(report, null, 2);
    const parsed = JSON.parse(jsonString);

    strictEqual(parsed.scannedAt, "2025-02-01T12:00:00.000Z");
    strictEqual(parsed.summary.fresh, 2);
    strictEqual(parsed.summary.warning, 1);
    strictEqual(parsed.summary.critical, 0);
    strictEqual(A.length(parsed.items), 3);
    strictEqual(parsed.hasCritical, false);
  });

  it("round-trips through JSON.stringify and Schema decode", () => {
    const report: S.Schema.Type<typeof FreshnessReport> = {
      scannedAt: "2025-02-01T12:00:00.000Z",
      summary: { fresh: 1, warning: 0, critical: 1 },
      items: [
        {
          path: ".repos/effect",
          category: "effect-repo",
          lastModified: "2024-11-01T10:00:00.000Z",
          ageInDays: 92,
          status: "critical",
        },
      ],
      hasCritical: true,
    };

    const jsonString = JSON.stringify(report);
    const parsed = JSON.parse(jsonString);
    const decoded = S.decodeUnknownEither(FreshnessReport)(parsed);

    expect(Either.isRight(decoded)).toBe(true);
    if (Either.isRight(decoded)) {
      strictEqual(decoded.right.hasCritical, true);
      strictEqual(A.length(decoded.right.items), 1);
      strictEqual(decoded.right.items[0]?.status, "critical");
    }
  });
});
